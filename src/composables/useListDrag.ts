import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'

export type ListEntry = { kind: 'item'; id: string } | { kind: 'placeholder' }

const DRAG_THRESHOLD = 4
const SETTLE_MS = 180
const SLIDE_MS = 250
const ITEM = '[data-drag-id]'

// The ids in order plus, while dragging, the placeholder at the slot where the dragged item
// would land. The dragged item stays in the list (hidden) so it keeps its identity.
export function withPlaceholder(
  ids: string[],
  draggingId: string | null,
  slotIndex: number | null,
): ListEntry[] {
  const entries: ListEntry[] = []
  let staying = 0
  for (const id of ids) {
    if (id !== draggingId) {
      if (slotIndex === staying) entries.push({ kind: 'placeholder' })
      staying++
    }
    entries.push({ kind: 'item', id })
  }
  if (slotIndex !== null && slotIndex >= staying) entries.push({ kind: 'placeholder' })
  return entries
}

interface Options {
  /** The element that holds the items (each one marked with `data-drag-id`), stacked vertically. */
  list: Ref<HTMLElement | null>
  ids: () => string[]
  labelOf: (id: string) => string
  /** Insert `id` right before `beforeId`, or at the end when it is null. */
  onMove: (id: string, beforeId: string | null) => void | Promise<void>
}

// Drag to reorder a vertical list. Same mechanic as the wishlist sections (see CLAUDE.md), with a
// single column: pointer events, a ghost that follows the pointer, a placeholder marking the slot,
// the others sliding out of the way, and insertion instead of swapping.
export function useListDrag({ list, ids, labelOf, onMove }: Options) {
  const draggingId = ref<string | null>(null)
  const draggingHeight = ref(0)
  const slotIndex = ref<number | null>(null)
  const ghost = ref<{
    x: number
    y: number
    width: number
    label: string
    height?: number
    settling?: boolean
  } | null>(null)

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let pending: { id: string; startX: number; startY: number; rect: DOMRect } | null = null
  let grab = { x: 0, y: 0 }
  let settling = false

  const entries = computed(() => withPlaceholder(ids(), draggingId.value, slotIndex.value))

  // Sliding: measure every item before the layout changes and animate it from there.
  const slideRects = new Map<string, DOMRect>()

  function slidingElements(): HTMLElement[] {
    return Array.from(list.value?.querySelectorAll<HTMLElement>(`${ITEM}, .placeholder`) ?? [])
  }

  const slideKey = (element: HTMLElement) => element.dataset.dragId ?? 'placeholder'

  watch(
    entries,
    () => {
      slideRects.clear()
      for (const element of slidingElements()) {
        if (!element.classList.contains('dragging')) {
          slideRects.set(slideKey(element), element.getBoundingClientRect())
        }
      }
    },
    { flush: 'pre' },
  )

  watch(
    entries,
    () => {
      const elements = slidingElements()
      for (const element of elements) {
        element.getAnimations().filter((a) => a.id === 'slide').forEach((a) => a.cancel())
      }
      if (reducedMotion.matches) return
      for (const element of elements) {
        const before = slideRects.get(slideKey(element))
        if (!before || element.classList.contains('dragging')) continue
        const now = element.getBoundingClientRect()
        const dy = before.top - now.top
        if (Math.abs(dy) < 0.5) continue
        const slide = element.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
          { duration: SLIDE_MS, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
        )
        slide.id = 'slide'
      }
    },
    { flush: 'post' },
  )

  function stopTracking() {
    pending = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', cancelDrag)
    window.removeEventListener('keydown', onKeyDown)
  }

  /** Call from the handle pointerdown; the drag begins once the pointer has moved a little. */
  function startDrag(id: string, event: PointerEvent, rect: DOMRect) {
    if (settling) return
    stopTracking()
    pending = { id, startX: event.clientX, startY: event.clientY, rect }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', cancelDrag)
    window.addEventListener('keydown', onKeyDown)
  }

  function beginDrag(started: NonNullable<typeof pending>) {
    const index = ids().indexOf(started.id)
    if (index < 0) {
      stopTracking()
      return
    }
    grab = { x: started.startX - started.rect.left, y: started.startY - started.rect.top }
    draggingId.value = started.id
    draggingHeight.value = started.rect.height
    slotIndex.value = index
    ghost.value = {
      x: started.rect.left,
      y: started.rect.top,
      width: started.rect.width,
      label: labelOf(started.id),
    }
    document.body.classList.add('is-dragging')
  }

  function endDrag() {
    draggingId.value = null
    slotIndex.value = null
    ghost.value = null
    document.body.classList.remove('is-dragging')
  }

  function cancelDrag() {
    stopTracking()
    endDrag()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') cancelDrag()
  }

  function onPointerMove(event: PointerEvent) {
    if (!pending) return
    if (!draggingId.value) {
      const moved = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY)
      if (moved < DRAG_THRESHOLD) return
      beginDrag(pending)
      if (!draggingId.value) return
    }
    if (ghost.value) {
      ghost.value = { ...ghost.value, x: event.clientX - grab.x, y: event.clientY - grab.y }
    }
    updateSlot(event.clientY)
  }

  // Worked out on the items stacked as if the placeholder were not there, using their heights
  // (which running slides do not change) instead of where they are drawn right now. Otherwise the
  // placeholder would push the items under the pointer and the slot would flip back and forth.
  function updateSlot(pointerY: number) {
    const container = list.value
    if (!container) return
    const items = Array.from(container.querySelectorAll<HTMLElement>(ITEM)).filter(
      (item) => item.dataset.dragId !== draggingId.value,
    )
    const gap = Number.parseFloat(getComputedStyle(container).rowGap) || 0
    const offset = pointerY - container.getBoundingClientRect().top
    let index = items.length
    let top = 0
    for (const [position, item] of items.entries()) {
      if (offset < top + item.offsetHeight / 2) {
        index = position
        break
      }
      top += item.offsetHeight + gap
    }
    if (slotIndex.value !== index) slotIndex.value = index
  }

  async function onPointerUp() {
    stopTracking()
    if (draggingId.value) await drop()
  }

  // The ghost glides onto the placeholder before the item is really moved.
  async function drop() {
    const id = draggingId.value
    const index = slotIndex.value
    const box = list.value?.querySelector<HTMLElement>('.placeholder')?.getBoundingClientRect()
    if (ghost.value && box && !reducedMotion.matches) {
      settling = true
      ghost.value = {
        ...ghost.value,
        x: box.left,
        y: box.top,
        width: box.width,
        height: box.height,
        settling: true,
      }
      await new Promise((resolve) => window.setTimeout(resolve, SETTLE_MS))
      settling = false
    }
    endDrag()
    if (id === null || index === null) return
    const staying = ids().filter((other) => other !== id)
    await onMove(id, staying[index] ?? null)
  }

  /** Keyboard alternative: move an item one place up (-1) or down (1). */
  async function nudge(id: string, direction: -1 | 1) {
    const all = ids()
    const position = all.indexOf(id)
    if (position < 0) return
    if (direction === -1 && position > 0) await onMove(id, all[position - 1])
    else if (direction === 1 && position < all.length - 1) await onMove(id, all[position + 2] ?? null)
  }

  onBeforeUnmount(cancelDrag)

  return { entries, draggingId, draggingHeight, ghost, startDrag, nudge, cancelDrag }
}

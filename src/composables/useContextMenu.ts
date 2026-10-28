import { shallowRef } from 'vue'
import type { MenuItem } from '../components/menuItem'

export interface OpenContextMenu {
  x: number
  y: number
  items: MenuItem[]
  select: (id: string) => void
  /** What had the focus before the menu opened, to give it back when it closes. */
  returnFocus: HTMLElement | null
}

// A single right-click menu for the whole app, drawn by `ContextMenu.vue` in `App.vue`: opening
// one replaces whatever menu was open.
const current = shallowRef<OpenContextMenu | null>(null)

// The minimal shape of the browser's `contextmenu` event this needs, so tests can fake it.
type ContextEvent = Pick<MouseEvent, 'clientX' | 'clientY' | 'defaultPrevented' | 'preventDefault'> & {
  target: EventTarget | null
  currentTarget: EventTarget | null
}

// Text fields keep the browser's own menu, with cut, copy and paste.
const TEXT_FIELD = 'input, textarea, select, [contenteditable="true"]'

/**
 * Shows the app's menu where the right click was, instead of the browser's. The innermost element
 * wins: a list item's menu opens rather than its section's. With no enabled option it leaves the
 * browser's menu alone.
 */
export function openContextMenu<T extends string>(
  event: ContextEvent,
  items: MenuItem<T>[],
  onSelect: (id: T) => void,
) {
  const target = event.target as Element | null
  if (event.defaultPrevented || target?.closest?.(TEXT_FIELD)) return
  if (!items.some((item) => !item.disabled)) return
  event.preventDefault()

  // The keyboard's menu key fires the event without a pointer: place it at the element instead.
  let { clientX: x, clientY: y } = event
  const anchor = event.currentTarget as Element | null
  if (x === 0 && y === 0 && anchor?.getBoundingClientRect) {
    const rect = anchor.getBoundingClientRect()
    x = rect.left + 16
    y = rect.top + rect.height / 2
  }

  current.value = {
    x,
    y,
    items,
    select: (id) => {
      const item = items.find((option) => option.id === id)
      if (item && !item.disabled) onSelect(item.id)
    },
    returnFocus: typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null),
  }
}

export function closeContextMenu() {
  current.value = null
}

export function useContextMenu() {
  return { current, close: closeContextMenu }
}

/** Keeps a menu of `width`×`height` opened at (x, y) inside the viewport, `margin` from its edges. */
export function fitInViewport(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  margin = 8,
) {
  // Like the browser's own menu: if it does not fit after the pointer, it opens before it.
  const left = x + width + margin > viewportWidth ? x - width : x
  const top = y + height + margin > viewportHeight ? y - height : y
  return {
    left: Math.max(margin, Math.min(left, viewportWidth - width - margin)),
    top: Math.max(margin, Math.min(top, viewportHeight - height - margin)),
  }
}

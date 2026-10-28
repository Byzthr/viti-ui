import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'

// The height that takes an element from where it starts in the page to the bottom of the
// window, leaving `bottom` pixels below it, but never less than `min`.
export function fillHeight(windowHeight: number, top: number, bottom: number, min: number): number {
  // Rounded down: rounding a fraction up would leave a pixel to scroll.
  return Math.max(min, Math.floor(windowHeight - top - bottom))
}

// Where an element starts in the page. offsetTop ignores transforms, so an element measured in
// the middle of an animation (the calendar's zoom) still gets its real place.
function pageTop(el: HTMLElement): number {
  let top = 0
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop
  }
  return top
}

// The room the page keeps under an element that ends its containers: its own bottom margin and
// the bottom padding, border and margin of each container around it. Leaving exactly that much
// makes the page end at the window's edge, with nothing left to scroll.
function spaceBelow(el: HTMLElement): number {
  let space = parseFloat(getComputedStyle(el).marginBottom) || 0
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    space +=
      (parseFloat(style.paddingBottom) || 0) +
      (parseFloat(style.borderBottomWidth) || 0) +
      (parseFloat(style.marginBottom) || 0)
  }
  return space
}

// Sizes an element to fill the rest of the window below it, for panels that scroll on their own
// (like the calendar's hour grid) instead of making the whole page longer. Measured again when
// the window is resized or anything in the page changes size (e.g. content above it grows). It
// must be the last thing in the page's flow: the space under it is measured from its containers.
export function useFillHeight(el: Ref<HTMLElement | null>, { min = 320 } = {}) {
  const height = ref<string | undefined>()
  let observer: ResizeObserver | null = null

  function measure() {
    if (!el.value) return
    const next = `${fillHeight(window.innerHeight, pageTop(el.value), spaceBelow(el.value), min)}px`
    // Its own size changes the body's too: only setting a different value avoids a loop.
    if (next !== height.value) height.value = next
  }

  onMounted(() => {
    measure()
    window.addEventListener('resize', measure)
    observer = new ResizeObserver(measure)
    observer.observe(document.body)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measure)
    observer?.disconnect()
  })

  return { height, measure }
}

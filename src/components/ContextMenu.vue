<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fitInViewport, useContextMenu } from '../composables/useContextMenu'
import MenuList from './MenuList.vue'

// The app's right-click menu, mounted once in `App.vue`; features open it with `openContextMenu`.
// It opens at the pointer, kept inside the window, and closes with Esc, a click elsewhere, a
// scroll or when the window changes size.
const { current, close } = useContextMenu()

// MenuList is generic, so `InstanceType` cannot describe it: this is what it exposes.
const menu = ref<{ focusFirst: () => void; el: HTMLElement | null } | null>(null)
const position = ref({ left: 0, top: 0 })

// It is first drawn at the pointer, hidden, to measure it, and then moved to where it fits.
const measured = ref(false)

watch(current, async (open) => {
  measured.value = false
  if (!open) return
  position.value = { left: open.x, top: open.y }
  await nextTick()
  const el = menu.value?.el
  if (!el) return
  position.value = fitInViewport(
    open.x,
    open.y,
    el.offsetWidth,
    el.offsetHeight,
    window.innerWidth,
    window.innerHeight,
  )
  measured.value = true
  menu.value?.focusFirst()
})

function dismiss() {
  const returnFocus = current.value?.returnFocus
  close()
  returnFocus?.focus()
}

function choose(id: string) {
  const open = current.value
  dismiss()
  open?.select(id)
}

function onPointerDown(event: PointerEvent) {
  if (current.value && !menu.value?.el?.contains(event.target as Node)) close()
}

function onKeyDown(event: KeyboardEvent) {
  if (current.value && event.key === 'Escape') dismiss()
}

// Capture, so a scroll inside any panel (not only the page's) closes it too.
onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown, true)
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
  window.addEventListener('blur', close)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
  document.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
  window.removeEventListener('blur', close)
})
</script>

<template>
  <MenuList
    v-if="current"
    ref="menu"
    class="context-menu"
    :class="{ measured }"
    :items="current.items"
    :style="{ left: `${position.left}px`, top: `${position.top}px` }"
    @select="choose"
    @contextmenu.prevent
  />
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 60;
  transform-origin: top left;
  visibility: hidden;
}

.context-menu.measured {
  visibility: visible;
}
</style>

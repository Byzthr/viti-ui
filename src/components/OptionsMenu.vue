<script setup lang="ts" generic="T extends string">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import MenuList from './MenuList.vue'
import type { MenuItem } from './menuItem'

// The three-dot menu at the top right of a list that holds its occasional actions (delete all,
// see the deleted ones...), so they stay out of the way of the list itself.
defineProps<{ label: string; items: MenuItem<T>[] }>()

const emit = defineEmits<{ select: [id: T] }>()

const open = ref(false)
const menu = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

function closeAndFocus() {
  open.value = false
  trigger.value?.focus()
}

function choose(id: T) {
  open.value = false
  emit('select', id)
}

function onDocumentClick(event: MouseEvent) {
  if (open.value && menu.value && !menu.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="menu" class="menu" @keydown.esc="closeAndFocus">
    <button
      ref="trigger"
      type="button"
      class="menu-trigger"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-label="label"
      title="Opciones"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="12" cy="19" r="1.8" />
      </svg>
    </button>
    <MenuList v-if="open" class="options-list" :items="items" @select="choose" />
  </div>
</template>

<style scoped>
.menu {
  position: relative;
  flex-shrink: 0;
}

.menu-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.menu-trigger:hover,
.menu-trigger[aria-expanded='true'],
.menu-trigger:focus-visible {
  color: var(--color-primary);
  background: var(--color-soft);
}

.options-list {
  position: absolute;
  top: calc(100% + 0.35rem);
  right: 0;
  z-index: 10;
  transform-origin: top right;
}

button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .menu-trigger {
    transition: none;
  }
}
</style>

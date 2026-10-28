<script setup lang="ts" generic="T extends string">
import { ref } from 'vue'
import type { MenuItem } from './menuItem'

// The floating list of options shared by the three-dot menu and the right-click menu. It only
// draws the options and reports the chosen one; whoever shows it places it and closes it.
defineProps<{ items: MenuItem<T>[] }>()

const emit = defineEmits<{ select: [id: T] }>()

const list = ref<HTMLElement | null>(null)

function focusFirst() {
  list.value?.querySelector<HTMLButtonElement>('.menu-item:not(:disabled)')?.focus()
}

// Up and down move between the enabled options, wrapping round at the ends.
function moveFocus(step: 1 | -1) {
  const options = [...(list.value?.querySelectorAll<HTMLButtonElement>('.menu-item:not(:disabled)') ?? [])]
  if (!options.length) return
  const current = options.indexOf(document.activeElement as HTMLButtonElement)
  options[(current + step + options.length) % options.length].focus()
}

defineExpose({ focusFirst, el: list })
</script>

<template>
  <ul
    ref="list"
    class="menu-list"
    role="menu"
    @keydown.down.prevent="moveFocus(1)"
    @keydown.up.prevent="moveFocus(-1)"
  >
    <li v-for="item in items" :key="item.id" role="none">
      <button
        type="button"
        role="menuitem"
        class="menu-item"
        :class="{ danger: item.danger }"
        :disabled="item.disabled"
        @click="emit('select', item.id)"
      >
        <svg
          v-if="item.icon"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="item.icon" />
        </svg>
        {{ item.label }}
      </button>
    </li>
  </ul>
</template>

<style scoped>
.menu-list {
  min-width: 15rem;
  margin: 0;
  padding: 0.35rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  list-style: none;
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
  animation: menu-in 0.14s ease-out;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
}

/* Rows of at least 2.75rem (44px), the size a finger can hit comfortably. */
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 2.75rem;
  padding: 0.55rem 0.8rem;
  border: 0;
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 0.95rem;
  color: var(--color-text);
  text-align: left;
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.menu-item svg {
  flex-shrink: 0;
  color: var(--color-primary);
}

.menu-item.danger svg,
.menu-item:disabled svg {
  color: inherit;
}

.menu-item:hover:not(:disabled),
.menu-item:focus-visible {
  background: var(--color-hover);
}

.menu-item.danger {
  color: var(--color-danger-text);
}

.menu-item.danger:hover:not(:disabled),
.menu-item.danger:focus-visible {
  background: var(--color-danger-soft);
}

.menu-item:disabled {
  color: var(--color-text-faint);
  cursor: not-allowed;
}

.menu-item:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .menu-item {
    transition: none;
  }

  .menu-list {
    animation: none;
  }
}
</style>

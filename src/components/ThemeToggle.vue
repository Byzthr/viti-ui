<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

// `compact` folds away the icon of the mode not in use, leaving a single round button, for when
// something beside it needs the room.
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { theme, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :class="{ compact }"
    role="switch"
    :aria-checked="theme === 'dark'"
    aria-label="Modo oscuro"
    :title="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    @click="toggle"
  >
    <span class="track" aria-hidden="true">
      <span class="knob" :class="theme"></span>
      <svg
        class="icon"
        :class="{ active: theme === 'light' }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        />
      </svg>
      <svg
        class="icon"
        :class="{ active: theme === 'dark' }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  width: fit-content;
  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);
  background: transparent;
  cursor: pointer;
}

.theme-toggle:hover .track {
  border-color: var(--color-border);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* A pill with the sun and the moon; a white knob slides under the theme in use. */
.track {
  position: relative;
  display: flex;
  flex-shrink: 0;
  padding: 0.2rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-pill);
  background: var(--color-surface-alt);
  transition: border-color 0.15s ease;
}

.knob {
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-raised);
  transition: transform 0.25s cubic-bezier(0.3, 0.7, 0.4, 1);
}

.knob.dark {
  transform: translateX(1.75rem);
}

/* With the sun folded away the moon is first, so the knob stays where it starts. */
.compact .knob.dark {
  transform: none;
}

.icon {
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0.35rem;
  color: var(--color-text-faint);
  transition: color 0.2s ease, width 0.3s cubic-bezier(0.3, 0.7, 0.4, 1), opacity 0.15s ease;
}

.compact .icon:not(.active) {
  width: 0;
  padding: 0;
  opacity: 0;
}

.icon.active {
  color: var(--color-primary);
}

@media (prefers-reduced-motion: reduce) {
  .track,
  .knob,
  .icon {
    transition: none;
  }
}
</style>

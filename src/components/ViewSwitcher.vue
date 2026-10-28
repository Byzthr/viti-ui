<script setup lang="ts" generic="T extends string">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{ modes: { id: T; label: string }[]; active: T; label?: string }>(),
  { label: 'Vista del calendario' },
)
const emit = defineEmits<{ select: [id: T] }>()

const tabRefs = ref<(HTMLButtonElement | null)[]>([])
// The pill's position and width, read off the active tab's own box so it works for any label
// length without hardcoding sizes.
const marker = ref({ left: 0, width: 0 })

function updateMarker() {
  const el = tabRefs.value[props.modes.findIndex((mode) => mode.id === props.active)]
  if (el) marker.value = { left: el.offsetLeft, width: el.offsetWidth }
}

onMounted(updateMarker)
watch(() => props.active, () => nextTick(updateMarker))
</script>

<template>
  <div class="view-switcher" role="tablist" :aria-label="label">
    <span
      class="marker"
      aria-hidden="true"
      :style="{ left: `${marker.left}px`, width: `${marker.width}px` }"
    ></span>
    <button
      v-for="mode in modes"
      :key="mode.id"
      ref="tabRefs"
      type="button"
      role="tab"
      :aria-selected="active === mode.id"
      :class="{ active: active === mode.id }"
      @click="emit('select', mode.id)"
    >
      {{ mode.label }}
    </button>
  </div>
</template>

<style scoped>
/* A pill-shaped track; the active tab sits on an iris-tinted chip that slides between tabs. */
.view-switcher {
  position: relative;
  display: flex;
  width: fit-content;
  gap: 0.15rem;
  padding: 0.25rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

/* Slides and resizes to sit behind whichever tab is active, instead of each tab fading its own
   background in and out - so it visibly travels from the old tab to the clicked one. */
.marker {
  position: absolute;
  top: 0.25rem;
  bottom: 0.25rem;
  border-radius: var(--radius-pill);
  background: var(--color-soft-strong);
  box-shadow: var(--shadow-soft);
  transition:
    left 0.25s cubic-bezier(0.3, 0.7, 0.4, 1),
    width 0.25s cubic-bezier(0.3, 0.7, 0.4, 1);
}

.view-switcher button {
  position: relative;
  z-index: 1;
  padding: 0.4rem 1rem;
  border: 0;
  border-radius: var(--radius-pill);
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease;
}

.view-switcher button:hover {
  color: var(--color-text);
}

.view-switcher button.active {
  color: var(--color-primary);
  font-weight: 600;
}

.view-switcher button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .marker {
    transition: none;
  }
}
</style>

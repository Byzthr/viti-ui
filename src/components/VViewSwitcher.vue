<script setup lang="ts" generic="T extends string">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { nextIndex } from './switcherKeys'

// `pill` is the sliding pill; `tabs`, window tabs that sit on top of a panel (the consumer draws
// the panel right below, without its top border); `vertical`, a column of tabs beside a panel.
const props = withDefaults(
  defineProps<{
    modes: { id: T; label: string; count?: number }[]
    active: T
    label?: string
    variant?: 'pill' | 'tabs' | 'vertical'
  }>(),
  { label: 'Vista del calendario', variant: 'pill' },
)
const emit = defineEmits<{ select: [id: T] }>()

const orientation = computed(() => (props.variant === 'vertical' ? 'vertical' : 'horizontal'))
const activeIndex = computed(() => props.modes.findIndex((mode) => mode.id === props.active))

const tabRefs = ref<(HTMLButtonElement | null)[]>([])
// The pill's position and width, read off the active tab's own box so it works for any label
// length without hardcoding sizes.
const marker = ref({ left: 0, width: 0 })

function updateMarker() {
  const el = tabRefs.value[activeIndex.value]
  if (el) marker.value = { left: el.offsetLeft, width: el.offsetWidth }
}

onMounted(updateMarker)
watch(
  () => props.active,
  () =>
    nextTick(() => {
      updateMarker()
      tabRefs.value[activeIndex.value]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }),
)

// Only the active tab is in the tab order; the arrows of the switcher's orientation, Home and
// End pick another one, as a click would.
function onKeydown(event: KeyboardEvent) {
  const index = nextIndex(activeIndex.value, event.key, props.modes.length, orientation.value)
  if (index === null) return
  event.preventDefault()
  emit('select', props.modes[index].id)
  tabRefs.value[index]?.focus()
}
</script>

<template>
  <div
    class="view-switcher"
    :class="variant"
    role="tablist"
    :aria-label="label"
    :aria-orientation="orientation"
    @keydown="onKeydown"
  >
    <span
      v-if="variant === 'pill'"
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
      :tabindex="active === mode.id ? 0 : -1"
      :class="{ active: active === mode.id }"
      @click="emit('select', mode.id)"
    >
      <span class="text">{{ mode.label }}</span>
      <span v-if="mode.count !== undefined" class="count">{{ mode.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.view-switcher {
  position: relative;
  display: flex;
}

.view-switcher button {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 0;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
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

.count {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-faint);
}

/* Pill: a pill-shaped track; the active tab sits on an iris-tinted chip that slides between
   tabs. */
.pill {
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

.pill button {
  padding: 0.4rem 1rem;
  border-radius: var(--radius-pill);
}

/* Tabs: the strip's bottom line is the panel's top edge; the active tab covers it, so it opens
   into the panel below. Scrolls sideways when the tabs do not fit. */
.tabs {
  gap: 0.15rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);
  scrollbar-width: thin;
}

.tabs button {
  flex-shrink: 0;
  margin-bottom: -1px;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-bottom: 0;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  white-space: nowrap;
}

.tabs button:hover:not(.active) {
  background: var(--color-hover);
}

.tabs button.active {
  border-color: var(--color-border);
  background: var(--color-surface);
  box-shadow: 0 1px 0 var(--color-surface);
}

.tabs button:focus-visible {
  outline-offset: -2px;
}

/* Vertical: a column; the active tab gets a bar of the accent color on its left and a soft
   background. */
.vertical {
  flex-direction: column;
  gap: 0.1rem;
}

.vertical button {
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  border-left: 3px solid transparent;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  text-align: left;
}

.vertical button:hover:not(.active) {
  background: var(--color-hover);
}

.vertical button.active {
  border-left-color: var(--color-primary);
  background: var(--color-soft);
}

@media (prefers-reduced-motion: reduce) {
  .marker,
  .view-switcher button {
    transition: none;
  }
}
</style>

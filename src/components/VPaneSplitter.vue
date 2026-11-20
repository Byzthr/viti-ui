<script setup lang="ts">
import { ref } from 'vue'
import { clampWidth } from './paneSplitter'

// The draggable border of a panel. The panel keeps the width (v-model); with side 'end' it sits
// to the right of the border, so dragging left widens it.
const KEY_STEP = 16

const props = withDefaults(
  defineProps<{ modelValue: number; min: number; max: number; side?: 'start' | 'end'; label: string }>(),
  { side: 'start' },
)
const emit = defineEmits<{ 'update:modelValue': [width: number]; reset: [] }>()

const dragging = ref(false)
let startX = 0
let startWidth = 0

function direction(): number {
  return props.side === 'end' ? -1 : 1
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) return
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  startX = event.clientX
  startWidth = props.modelValue
  dragging.value = true
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  const delta = (event.clientX - startX) * direction()
  emit('update:modelValue', clampWidth(startWidth, delta, props.min, props.max))
}

function onPointerEnd(): void {
  dragging.value = false
}

function onKeydown(event: KeyboardEvent): void {
  let width: number
  if (event.key === 'ArrowLeft') {
    width = clampWidth(props.modelValue, -KEY_STEP * direction(), props.min, props.max)
  } else if (event.key === 'ArrowRight') {
    width = clampWidth(props.modelValue, KEY_STEP * direction(), props.min, props.max)
  } else if (event.key === 'Home') {
    width = props.min
  } else if (event.key === 'End') {
    width = props.max
  } else {
    return
  }
  event.preventDefault()
  emit('update:modelValue', width)
}
</script>

<template>
  <div
    class="v-pane-splitter"
    :class="{ dragging }"
    role="separator"
    aria-orientation="vertical"
    tabindex="0"
    :aria-label="label"
    :aria-valuenow="modelValue"
    :aria-valuemin="min"
    :aria-valuemax="max"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
    @pointercancel="onPointerEnd"
    @dblclick="emit('reset')"
    @keydown="onKeydown"
  ></div>
</template>

<style scoped>
.v-pane-splitter {
  position: relative;
  flex-shrink: 0;
  width: 1px;
  background: var(--color-border-soft);
  cursor: col-resize;
  touch-action: none;
  user-select: none;
  transition: background-color 0.15s ease;
}

/* A wider invisible hit area, so the 1px line is easy to grab. */
.v-pane-splitter::before {
  content: '';
  position: absolute;
  inset: 0 -4px;
}

.v-pane-splitter:hover,
.v-pane-splitter.dragging {
  background: var(--color-line-hover);
}

.v-pane-splitter:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .v-pane-splitter {
    transition: none;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { CENTER, dialLabels, hourPoint, minutePoint, valueAt } from './clockDial'
import type { DialMode } from './clockDial'

// A time field picked on an analog clock face, like Material's time picker: first the hour (1–12
// on the outer ring, 00 and 13–23 on the inner one), then the minutes, clicking or dragging the
// hand. The arrows move the hand and Enter goes on to the minutes or closes. The value is an
// "hh:mm" string; a minute outside the `step` (e.g. 09:07) is kept until the minutes are picked.
const props = withDefaults(defineProps<{ label: string; step?: number }>(), { step: 5 })

const model = defineModel<string>({ required: true })

const open = ref(false)
const mode = ref<DialMode>('hours')
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const dial = ref<SVGSVGElement | null>(null)
let dragging = false

const pad = (value: number) => String(value).padStart(2, '0')

const hour = computed(() => Number(model.value.slice(0, 2)) || 0)
const minute = computed(() => Number(model.value.slice(3, 5)) || 0)
const value = computed(() => (mode.value === 'hours' ? hour.value : minute.value))

const labels = computed(() => dialLabels(mode.value))
const hand = computed(() => (mode.value === 'hours' ? hourPoint(hour.value) : minutePoint(minute.value)))

function setValue(next: number) {
  model.value =
    mode.value === 'hours' ? `${pad(next)}:${pad(minute.value)}` : `${pad(hour.value)}:${pad(next)}`
}

async function toggle() {
  open.value = !open.value
  if (!open.value) return
  mode.value = 'hours'
  await nextTick()
  dial.value?.focus()
}

function closeAndFocus() {
  open.value = false
  trigger.value?.focus()
}

// Picking the hour goes on to the minutes; picking the minutes completes the time.
function advance() {
  if (mode.value === 'hours') mode.value = 'minutes'
  else closeAndFocus()
}

// The pointer's position in the SVG's own 200×200 coordinates, whatever size it is drawn at.
function pickAt(event: PointerEvent) {
  if (!dial.value) return
  const box = dial.value.getBoundingClientRect()
  const scale = (CENTER * 2) / box.width
  const point = { x: (event.clientX - box.left) * scale, y: (event.clientY - box.top) * scale }
  setValue(valueAt(mode.value, point, props.step))
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  dragging = true
  dial.value?.setPointerCapture(event.pointerId)
  pickAt(event)
}

function onPointerMove(event: PointerEvent) {
  if (dragging) pickAt(event)
}

function onPointerUp() {
  if (!dragging) return
  dragging = false
  advance()
}

function nudge(direction: 1 | -1) {
  const size = mode.value === 'hours' ? 24 : 60
  const amount = mode.value === 'hours' ? 1 : props.step
  setValue((value.value + direction * amount + size) % size)
}

// Esc closes the panel only; with it closed, Esc goes on to whatever holds the picker (a dialog).
function onEscape(event: KeyboardEvent) {
  if (!open.value) return
  event.stopPropagation()
  closeAndFocus()
}

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="root" class="time-picker" @keydown.esc="onEscape">
    <button
      ref="trigger"
      type="button"
      class="trigger"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-label="`${label}: ${model}`"
      @click="toggle"
    >
      {{ model }}
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </button>

    <div v-if="open" class="panel" role="group" :aria-label="label">
      <div class="readout">
        <button
          type="button"
          class="part"
          :class="{ active: mode === 'hours' }"
          :aria-pressed="mode === 'hours'"
          aria-label="Elegir la hora"
          @click="mode = 'hours'"
        >
          {{ pad(hour) }}
        </button>
        <span aria-hidden="true">:</span>
        <button
          type="button"
          class="part"
          :class="{ active: mode === 'minutes' }"
          :aria-pressed="mode === 'minutes'"
          aria-label="Elegir los minutos"
          @click="mode = 'minutes'"
        >
          {{ pad(minute) }}
        </button>
      </div>

      <svg
        ref="dial"
        class="dial"
        viewBox="0 0 200 200"
        tabindex="0"
        role="slider"
        :aria-label="mode === 'hours' ? `${label}, hora` : `${label}, minutos`"
        :aria-valuemin="0"
        :aria-valuemax="mode === 'hours' ? 23 : 59"
        :aria-valuenow="value"
        :aria-valuetext="mode === 'hours' ? `${pad(hour)} horas` : `${pad(minute)} minutos`"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @keydown.up.prevent="nudge(1)"
        @keydown.right.prevent="nudge(1)"
        @keydown.down.prevent="nudge(-1)"
        @keydown.left.prevent="nudge(-1)"
        @keydown.enter.prevent="advance"
      >
        <circle class="face" :cx="CENTER" :cy="CENTER" r="98" />
        <line class="hand" :x1="CENTER" :y1="CENTER" :x2="hand.x" :y2="hand.y" />
        <circle class="pivot" :cx="CENTER" :cy="CENTER" r="3" />
        <circle class="knob" :cx="hand.x" :cy="hand.y" r="15" />
        <text
          v-for="item in labels"
          :key="`${mode}-${item.value}`"
          :x="item.point.x"
          :y="item.point.y"
          class="number"
          :class="{ inner: item.inner, selected: item.value === value }"
        >
          {{ item.text }}
        </text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.time-picker {
  position: relative;
}

.trigger {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 2.5rem;
  padding: 0 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.trigger svg {
  color: var(--color-text-faint);
}

.trigger:hover {
  border-color: var(--color-line-hover);
}

.trigger:focus-visible,
.trigger[aria-expanded='true'] {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 4px var(--color-ring);
  outline: none;
}

/* Centered under the field: it is wider than it, and so stays inside the dialog for both. */
.panel {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 50%;
  z-index: 10;
  width: 14rem;
  padding: 0.75rem;
  box-sizing: border-box;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
  transform: translateX(-50%);
}

.readout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  margin-bottom: 0.6rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-soft);
}

.part {
  padding: 0.1rem 0.4rem;
  border: 0;
  border-radius: var(--radius-sm);
  font: inherit;
  font-variant-numeric: tabular-nums;
  color: inherit;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.part:hover {
  background: var(--color-hover);
}

.part.active {
  color: var(--color-primary);
  background: var(--color-soft);
}

.dial {
  display: block;
  width: 100%;
  touch-action: none;
  cursor: pointer;
  user-select: none;
}

/* The browser draws the focus outline of an SVG as a square around it: the round face's own
   border shows the focus instead. */
.dial:focus {
  outline: none;
}

.dial:focus-visible .face {
  stroke: var(--color-focus);
  stroke-width: 2;
}

.face {
  fill: var(--color-surface-alt);
  stroke: var(--color-border-soft);
}

.hand {
  stroke: var(--color-primary);
  stroke-width: 2;
}

.pivot,
.knob {
  fill: var(--color-primary);
}

.number {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  text-anchor: middle;
  dominant-baseline: central;
  fill: var(--color-text);
  pointer-events: none;
}

.number.inner {
  font-size: 11px;
  fill: var(--color-text-muted);
}

.number.selected {
  font-weight: 600;
  fill: var(--color-on-primary);
}

@media (prefers-reduced-motion: reduce) {
  .trigger,
  .part {
    transition: none;
  }
}
</style>

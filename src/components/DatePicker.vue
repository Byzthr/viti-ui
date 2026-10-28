<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { parseDisplayDate, toDisplayDate } from '../utils/displayDate'
import { monthWeeks } from './monthCells'

// A dd/mm/yyyy date field: it can be typed, or picked on a month calendar that the button
// beside it opens. In the calendar the arrows move between days (and months), Enter picks the
// day and Esc closes it. Typing emits `input`, and so does picking, so the form can clear its
// errors either way.
const props = withDefaults(defineProps<{ label: string; required?: boolean }>(), {
  required: false,
})
const emit = defineEmits<{ input: [] }>()

const model = defineModel<string>({ required: true })

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const field = ref<HTMLInputElement | null>(null)
// The month on screen, and the day the keyboard is on.
const view = ref({ year: 0, month: 0 })
const focused = ref(new Date())

const today = new Date()
const selected = computed(() => parseDisplayDate(model.value))
const weeks = computed(() => monthWeeks(view.value.year, view.value.month))

const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.toDateString() === b.toDateString()

async function focusDay(date: Date) {
  focused.value = date
  view.value = { year: date.getFullYear(), month: date.getMonth() }
  await nextTick()
  root.value?.querySelector<HTMLButtonElement>(`[data-day="${date.toDateString()}"]`)?.focus()
}

// Opens on the month of the date typed, or of today when there is none yet.
function toggle() {
  open.value = !open.value
  if (open.value) focusDay(selected.value ?? new Date(today))
}

function close() {
  open.value = false
  field.value?.focus()
}

function pick(date: Date) {
  model.value = toDisplayDate(date)
  emit('input')
  close()
}

function moveBy(days: number) {
  const next = new Date(focused.value)
  next.setDate(next.getDate() + days)
  focusDay(next)
}

// The same day in the next or previous month, clamped to its length (31 -> 30, 28...).
function moveMonth(delta: 1 | -1) {
  const { year, month } = view.value
  const last = new Date(year, month + delta + 1, 0).getDate()
  focusDay(new Date(year, month + delta, Math.min(focused.value.getDate(), last)))
}

// Esc closes the calendar only; with it closed, Esc goes on to whatever holds the field (a dialog).
function onEscape(event: KeyboardEvent) {
  if (!open.value) return
  event.stopPropagation()
  close()
}

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="root" class="date-picker" @keydown.esc="onEscape">
    <div class="control">
      <input
        ref="field"
        v-model="model"
        type="text"
        inputmode="numeric"
        placeholder="dd/mm/aaaa"
        maxlength="10"
        :required="props.required"
        :aria-label="label"
        @input="emit('input')"
      />
      <button
        type="button"
        class="toggle"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-label="`${label}: abrir el calendario`"
        @click="toggle"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </button>
    </div>

    <div v-if="open" class="panel" role="dialog" :aria-label="label">
      <div class="head">
        <button type="button" class="nav" aria-label="Mes anterior" @click="moveMonth(-1)">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="title" aria-live="polite">{{ MONTHS[view.month] }} {{ view.year }}</span>
        <button type="button" class="nav" aria-label="Mes siguiente" @click="moveMonth(1)">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <div
        class="grid"
        role="group"
        aria-label="Días del mes"
        @keydown.left.prevent="moveBy(-1)"
        @keydown.right.prevent="moveBy(1)"
        @keydown.up.prevent="moveBy(-7)"
        @keydown.down.prevent="moveBy(7)"
        @keydown.page-up.prevent="moveMonth(-1)"
        @keydown.page-down.prevent="moveMonth(1)"
      >
        <span v-for="weekday in WEEKDAYS" :key="weekday" class="weekday" aria-hidden="true">
          {{ weekday }}
        </span>
        <template v-for="(week, weekIndex) in weeks" :key="weekIndex">
          <template v-for="(day, dayIndex) in week" :key="`${weekIndex}-${dayIndex}`">
            <button
              v-if="day"
              type="button"
              class="day"
              :class="{ today: sameDay(day, today), selected: sameDay(day, selected) }"
              :data-day="day.toDateString()"
              :tabindex="sameDay(day, focused) ? 0 : -1"
              :aria-label="`${day.getDate()} de ${MONTHS[day.getMonth()].toLowerCase()} de ${day.getFullYear()}`"
              :aria-pressed="sameDay(day, selected)"
              @click="pick(day)"
            >
              {{ day.getDate() }}
            </button>
            <span v-else></span>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
}

/* Looks like the dialog's other fields: the input and the button share one box. */
.control {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 2.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.control:hover {
  border-color: var(--color-line-hover);
}

.control:focus-within {
  border-color: var(--color-focus);
  background: var(--color-surface);
  box-shadow: 0 0 0 4px var(--color-ring);
}

input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 0.8rem;
  border: 0;
  font: inherit;
  font-weight: 400;
  color: var(--color-text);
  background: transparent;
  outline: none;
}

input::placeholder {
  color: var(--color-text-faint);
}

.toggle,
.nav {
  display: flex;
  padding: 0.35rem;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-text-faint);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.toggle {
  margin-right: 0.35rem;
}

.toggle:hover,
.toggle[aria-expanded='true'],
.nav:hover {
  color: var(--color-primary);
  background: var(--color-soft);
}

.toggle:focus-visible,
.nav:focus-visible,
.day:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
}

.panel {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  z-index: 10;
  width: 16rem;
  padding: 0.75rem;
  box-sizing: border-box;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.weekday {
  padding-bottom: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-faint);
  text-align: center;
}

.day {
  aspect-ratio: 1;
  border: 0;
  border-radius: 50%;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.day:hover {
  background: var(--color-hover);
}

.day.today {
  font-weight: 600;
  color: var(--color-primary);
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.day.selected {
  font-weight: 600;
  color: var(--color-on-primary);
  background: var(--color-primary);
}

@media (prefers-reduced-motion: reduce) {
  .control,
  .toggle,
  .nav,
  .day {
    transition: none;
  }
}
</style>

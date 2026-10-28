<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { LOOKS, useLook } from '../composables/useLook'
import type { Look } from '../composables/useLook'

// The look picker: a pill with the emoji of the look in use that, when pressed, grows into a
// narrow card with the emoji of every look (the one in use on a tinted background); pressing the
// arrow at its top widens it to show their names too. It shrinks back into the pill once one is
// chosen, with Escape, or when the pointer or the focus goes elsewhere, and opens narrow again
// next time. The card grows up and to the right from the pill's corner, and takes that width in
// its row too, so whatever is beside it moves along. `expand` tells when it is wide, so that
// neighbour can make room.
const emit = defineEmits<{ expand: [expanded: boolean] }>()

const { look, select } = useLook()

const current = computed(() => LOOKS.find((option) => option.id === look.value) ?? LOOKS[0])

const open = ref(false)
const expanded = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const optionEls: HTMLButtonElement[] = []

watch(expanded, (value) => emit('expand', value))

function onPointerOutside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close(false)
}

async function show() {
  open.value = true
  document.addEventListener('pointerdown', onPointerOutside)
  await nextTick()
  optionEls[LOOKS.indexOf(current.value)]?.focus({ preventScroll: true })
}

// `returnFocus` gives the focus back to the pill, unless the user already took it elsewhere.
function close(returnFocus = true) {
  if (!open.value) return
  open.value = false
  expanded.value = false
  document.removeEventListener('pointerdown', onPointerOutside)
  if (returnFocus) trigger.value?.focus()
}

function choose(id: Look) {
  select(id)
  close()
}

function onFocusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) close(false)
}

// Up and down move between the looks, wrapping round at the ends.
function move(index: number, step: 1 | -1) {
  optionEls[(index + step + LOOKS.length) % LOOKS.length]?.focus()
}

onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerOutside))
</script>

<template>
  <div
    ref="root"
    class="look-picker"
    :class="{ open, expanded }"
    :style="{ '--count': LOOKS.length }"
    @keydown.esc.stop="close()"
    @focusout="onFocusOut"
  >
    <div class="card">
      <div class="options" :inert="!open">
        <button
          type="button"
          class="card-title"
          :aria-expanded="expanded"
          :aria-label="expanded ? 'Ocultar los nombres' : 'Mostrar los nombres'"
          :title="expanded ? undefined : 'Mostrar los nombres'"
          @click="expanded = !expanded"
        >
          <span class="title-text" aria-hidden="true">Estilo</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
        <div class="list" role="menu" aria-label="Estilo">
          <button
            v-for="(option, index) in LOOKS"
            :key="option.id"
            :ref="(el) => (optionEls[index] = el as HTMLButtonElement)"
            type="button"
            role="menuitemradio"
            class="option"
            :class="{ active: option.id === look }"
            :aria-checked="option.id === look"
            :aria-label="option.label"
            :title="expanded ? undefined : option.label"
            @click="choose(option.id)"
            @keydown.down.prevent="move(index, 1)"
            @keydown.up.prevent="move(index, -1)"
          >
            <span class="emoji" aria-hidden="true">{{ option.emoji }}</span>
            <span class="name">{{ option.label }}</span>
          </button>
        </div>
      </div>
      <button
        ref="trigger"
        type="button"
        class="trigger"
        aria-haspopup="menu"
        :aria-expanded="open"
        :aria-label="`Estilo: ${current.label}. Cambiar estilo`"
        :title="open ? undefined : `Estilo: ${current.label}`"
        :tabindex="open ? -1 : 0"
        @click="open ? close() : show()"
      >
        <span class="emoji" aria-hidden="true">{{ current.emoji }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/*
 * The picker takes the card's width in its row, growing and shrinking with it, so whatever is
 * beside it moves along; its height stays the pill's, and the card rises over the space above,
 * pinned to its bottom left corner, so the pill and the card are one shape. The wide card fits
 * the sidebar next to the compact light / dark switch.
 */
.look-picker {
  --pill: 2.25rem;
  --narrow-width: 3rem;
  --card-width: 9.5rem;
  --row: 2.25rem;
  --ease: cubic-bezier(0.3, 0.7, 0.4, 1);
  position: relative;
  flex-shrink: 0;
  width: var(--pill);
  height: var(--pill);
  transition: width 0.3s var(--ease) 0.08s;
}

.look-picker.open {
  width: var(--narrow-width);
  transition-delay: 0s;
}

.look-picker.open.expanded {
  width: var(--card-width);
}

/*
 * Opening, the shape grows first and the looks fade in once there is room; closing, they fade
 * out first and only then does it shrink back into the pill. The pill's rounding is half its
 * height rather than a huge pill radius, so it eases smoothly into the card's corners.
 */
.card {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 20;
  box-sizing: border-box;
  width: 100%;
  height: var(--pill);
  overflow: hidden;
  border: 1px solid var(--color-border-soft);
  border-radius: calc(var(--pill) / 2);
  background: var(--color-surface-alt);
  transition:
    height 0.3s var(--ease) 0.08s,
    border-radius 0.3s var(--ease) 0.08s,
    background 0.2s ease 0.08s,
    box-shadow 0.3s ease 0.08s,
    border-color 0.15s ease;
}

.look-picker:not(.open) .card:hover {
  border-color: var(--color-border);
}

.open .card {
  height: calc(var(--count) * var(--row) + 2.7rem + 2px);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
  transition-delay: 0s;
}

/* The looks follow the card's width as it grows, so the one in use keeps its rounded background
   inside it; their names stay on one line and are just uncovered. */
.options {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0.4rem;
  opacity: 0;
  transition: opacity 0.1s ease;
}

.open .options {
  opacity: 1;
  transition: opacity 0.2s ease 0.14s;
}

.card-title {
  display: flex;
  align-items: center;
  width: fit-content;
  padding: 0.35rem 0.5rem 0.45rem 0.55rem;
  border: 0;
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  background: transparent;
  cursor: pointer;
  transition: color 0.15s ease;
}

.card-title:hover {
  color: var(--color-primary);
}

.card-title:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: -2px;
}

/* The narrow card's title is just its arrow, over the emojis; the word comes in when it widens. */
.title-text {
  display: inline-block;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-width 0.3s var(--ease), margin 0.3s var(--ease), opacity 0.1s ease;
}

.expanded .title-text {
  max-width: 4rem;
  margin-right: 0.2rem;
  opacity: 1;
  transition: max-width 0.3s var(--ease), margin 0.3s var(--ease), opacity 0.2s ease 0.14s;
}

/* Points to where the names come from, and back once they are out. */
.card-title svg {
  width: 0.8rem;
  height: 0.8rem;
  transition: transform 0.3s var(--ease);
}

.expanded .card-title svg {
  transform: rotate(180deg);
}

.list {
  display: flex;
  flex-direction: column;
}

/* The names come in once the card has widened for them, and go before it narrows. */
.name {
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transition: opacity 0.1s ease;
}

.expanded .name {
  opacity: 1;
  transition: opacity 0.2s ease 0.14s;
}

.option {
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: 0.5rem;
  height: var(--row);
  padding: 0 0.5rem;
  border: 0;
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: 0.85rem;
  text-align: left;
  white-space: nowrap;
  color: var(--color-text-soft);
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.option:hover,
.option:focus-visible {
  color: var(--color-text);
  background: var(--color-hover);
}

.option:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: -2px;
}

.option.active,
.option.active:hover {
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-soft);
}

/* The pill itself, in the card's bottom left corner: it fades away as the card opens. */
.trigger {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--pill) - 2px);
  height: calc(var(--pill) - 2px);
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--color-text-soft);
  background: transparent;
  cursor: pointer;
  transition: opacity 0.15s ease 0.2s, color 0.15s ease;
}

.trigger:hover {
  color: var(--color-primary);
}

.open .trigger {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.1s ease;
}

.trigger:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* One-color emojis, in the color of the text around them (the look's accent on the one in use). */
.emoji {
  font-family: 'Segoe UI Symbol', 'Noto Sans Symbols 2', 'Apple Symbols', sans-serif;
  font-size: 1.1rem;
  font-variant-emoji: text;
  line-height: 1;
}

.trigger .emoji {
  transition: transform 0.15s ease;
}

.trigger:hover .emoji {
  transform: scale(1.15);
}

@media (prefers-reduced-motion: reduce) {
  .look-picker,
  .card,
  .open .card,
  .title-text {
    transition: none;
  }

  .trigger .emoji,
  .card-title svg,
  .option {
    transition: none;
  }
}
</style>

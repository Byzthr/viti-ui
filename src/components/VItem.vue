<script setup lang="ts">
import { ref } from 'vue'
import { openContextMenu } from '../composables/useContextMenu'
import { MENU_ICONS, type MenuItem } from './menuItem'

// Vitem: one item of a list. It can be dragged by its handle, has a check, an edit-in-place text
// and a delete button, and once deleted it shows its recovery version (with a restore button).
// Lists that need less (coordinates, birthdays) turn the check, the editing, the handle or the
// delete button off, or open the item in their own dialog, and the `prefix` and default slots add
// content before and after the text.
const props = withDefaults(
  defineProps<{
    text: string
    completed?: boolean
    deleted?: boolean
    /** What the item is called for screen readers: "tarea", "elemento"... */
    noun?: string
    /** Hidden while it is being dragged (the list shows a placeholder in its place). */
    dragging?: boolean
    /** Shows the check; without it a click on the text does nothing. */
    checkable?: boolean
    /** Lets a double click edit the text in place. */
    editable?: boolean
    /** Shows the drag handle. */
    reorderable?: boolean
    /** A double click (or Enter) emits `open` instead of editing in place, for items edited in a dialog. */
    openable?: boolean
    /** Shows the delete button. */
    removable?: boolean
  }>(),
  { checkable: true, editable: true, reorderable: true, removable: true },
)

const emit = defineEmits<{
  toggle: []
  edit: [text: string]
  remove: []
  restore: []
  dragstart: [event: PointerEvent, rect: DOMRect]
  move: [direction: 'up' | 'down']
  open: []
}>()

const DOUBLE_CLICK_MS = 250

const editing = ref(false)
const editText = ref('')
let clickTimer: number | undefined

const noun = () => props.noun ?? 'elemento'

const vFocus = {
  mounted: (el: HTMLInputElement) => {
    el.focus()
    el.select()
  },
}

// A single click on the text toggles the item, but waits briefly so a double click can edit instead.
function onTextClick() {
  window.clearTimeout(clickTimer)
  clickTimer = window.setTimeout(() => emit('toggle'), DOUBLE_CLICK_MS)
}

function startEdit() {
  window.clearTimeout(clickTimer)
  if (props.openable) {
    emit('open')
    return
  }
  if (!props.editable) return
  editText.value = props.text
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function commitEdit() {
  if (!editing.value) return
  editing.value = false
  emit('edit', editText.value)
}

type MenuAction = 'toggle' | 'edit' | 'up' | 'down' | 'remove' | 'restore'

// A right click offers what the item can already do, so only the actions it has turned on.
function onContextMenu(event: MouseEvent) {
  if (editing.value) return
  const items: MenuItem<MenuAction>[] = props.deleted
    ? [{ id: 'restore', label: 'Recuperar', icon: MENU_ICONS.restore }]
    : [
        ...(props.checkable
          ? [
              {
                id: 'toggle' as const,
                label: props.completed ? 'Desmarcar' : 'Marcar como hecho',
                icon: MENU_ICONS.check,
              },
            ]
          : []),
        ...(props.openable || props.editable
          ? [{ id: 'edit' as const, label: 'Editar', icon: MENU_ICONS.edit }]
          : []),
        ...(props.reorderable
          ? [
              { id: 'up' as const, label: 'Subir', icon: MENU_ICONS.up },
              { id: 'down' as const, label: 'Bajar', icon: MENU_ICONS.down },
            ]
          : []),
        ...(props.removable
          ? [{ id: 'remove' as const, label: 'Eliminar', icon: MENU_ICONS.remove, danger: true }]
          : []),
      ]
  openContextMenu(event, items, (id) => {
    if (id === 'edit') startEdit()
    else if (id === 'up' || id === 'down') emit('move', id)
    else if (id === 'toggle') emit('toggle')
    else if (id === 'remove') emit('remove')
    else emit('restore')
  })
}

// Dragging is driven by the list with pointer events; the item only reports where it began.
function onHandleDown(event: PointerEvent) {
  const row = (event.currentTarget as HTMLElement).closest('li')
  if (event.button !== 0 || !row) return
  event.preventDefault()
  emit('dragstart', event, row.getBoundingClientRect())
}
</script>

<template>
  <li
    class="vitem"
    :class="{ completed: completed && !deleted, deleted, dragging }"
    @contextmenu="onContextMenu"
  >
    <template v-if="deleted">
      <span class="deleted-text">{{ text }}</span>
      <button
        type="button"
        class="action restore"
        :aria-label="`Recuperar ${noun()}: ${text}`"
        @click="emit('restore')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </template>

    <template v-else>
      <button
        v-if="reorderable"
        type="button"
        class="handle"
        :aria-label="`Mover ${noun()}: ${text}. Usa las flechas arriba y abajo`"
        title="Arrastra para mover"
        @pointerdown="onHandleDown"
        @keydown.up.prevent="emit('move', 'up')"
        @keydown.down.prevent="emit('move', 'down')"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>

      <slot name="prefix" />

      <label v-if="checkable" :class="{ done: completed }">
        <input type="checkbox" :checked="completed" @change="emit('toggle')" />
        <input
          v-if="editing"
          v-model="editText"
          v-focus
          class="edit-input"
          type="text"
          :aria-label="`Editar ${noun()}`"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc="cancelEdit"
          @blur="commitEdit"
        />
        <span v-else class="text" @click.prevent="onTextClick" @dblclick.prevent="startEdit">{{
          text
        }}</span>
      </label>

      <!-- Without a check there is nothing to toggle, so the text is not a label. -->
      <template v-else>
        <input
          v-if="editing"
          v-model="editText"
          v-focus
          class="edit-input plain"
          type="text"
          maxlength="80"
          :aria-label="`Editar ${noun()}`"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc="cancelEdit"
          @blur="commitEdit"
        />
        <span
          v-else
          class="text plain"
          :class="{ editable: editable || openable }"
          :title="editable || openable ? 'Doble clic para editar' : undefined"
          :tabindex="editable || openable ? 0 : undefined"
          @dblclick.prevent="startEdit"
          @keydown.enter.prevent="startEdit"
          >{{ text }}</span
        >
      </template>

      <slot />

      <button
        v-if="removable"
        type="button"
        class="action delete"
        :aria-label="`Eliminar ${noun()}: ${text}`"
        @click="emit('remove')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </template>
  </li>
</template>

<style scoped>
/* Each status defines its own tint, hover tint, accent bar and glow. */
.vitem {
  --tint: var(--status-active-tint);
  --tint-hover: var(--status-active-tint-hover);
  --accent: var(--status-active-accent);
  --glow: var(--status-active-glow);

  display: flex;
  align-items: center;
  padding-right: 0.5rem;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  background: var(--tint);
  box-shadow: var(--shadow-soft);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.vitem.completed {
  --tint: var(--status-done-tint);
  --tint-hover: var(--status-done-tint-hover);
  --accent: var(--status-done-accent);
  --glow: var(--status-done-glow);
}

.vitem.deleted {
  --tint: var(--status-deleted-tint);
  --tint-hover: var(--status-deleted-tint-hover);
  --accent: var(--status-deleted-accent);
  --glow: var(--status-deleted-glow);
}

.vitem:hover {
  border-color: color-mix(in srgb, var(--accent) 35%, var(--color-border-soft));
  background: var(--tint-hover);
  box-shadow: 0 4px 14px var(--glow);
}

.vitem:focus-within {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* While it is dragged the item leaves the layout and the list shows a placeholder in its place. */
.vitem.dragging {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
}

label {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.75rem 0.7rem 0.25rem;
  cursor: pointer;
}

label input[type='checkbox'] {
  width: 1.05rem;
  height: 1.05rem;
  margin: 0;
  cursor: pointer;
}

label.done span {
  color: var(--color-text-faint);
  text-decoration: line-through;
}

.text {
  flex: 1;
  overflow-wrap: anywhere;
  user-select: none;
}

/* Same room as the label gives the text when there is a check. */
.text.plain {
  padding: 0.75rem 0.75rem 0.75rem 0.25rem;
}

.vitem:not(:has(.handle)) .plain {
  padding-left: 1rem;
}

.text.plain.editable {
  cursor: text;
}

.text.plain.editable:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: -2px;
  border-radius: var(--radius-sm);
}

.edit-input.plain {
  margin: 0.4rem 0.75rem 0.4rem 0.25rem;
}

.edit-input {
  flex: 1;
  min-width: 0;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-focus);
  border-radius: var(--radius-sm);
  font: inherit;
  background: var(--color-surface);
  cursor: text;
  outline: none;
  box-shadow: 0 0 0 3px var(--color-ring);
}

.deleted-text {
  flex: 1;
  padding: 0.75rem;
  color: var(--color-text-faint);
  overflow-wrap: anywhere;
}

.handle {
  display: flex;
  flex-shrink: 0;
  margin-left: 0.3rem;
  padding: 0.35rem 0.2rem;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-text-faint);
  background: transparent;
  opacity: 0;
  cursor: grab;
  touch-action: none;
  transition: opacity 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.vitem:hover .handle,
.vitem:hover .delete,
.handle:focus-visible,
.delete:focus-visible {
  opacity: 1;
}

.handle:hover,
.handle:focus-visible {
  color: var(--color-primary);
  background: var(--color-soft);
}

.handle:active {
  cursor: grabbing;
}

.action {
  display: flex;
  padding: 0.35rem;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.delete {
  opacity: 0;
}

.action:active {
  transform: scale(0.96);
}

.delete:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
  transform: scale(1.15);
}

.restore:hover {
  color: var(--color-primary);
  background: var(--color-soft);
  transform: scale(1.15);
}

.action:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .vitem,
  .handle,
  .action {
    transition: none;
  }

  .delete:hover,
  .restore:hover {
    transform: none;
  }
}
</style>

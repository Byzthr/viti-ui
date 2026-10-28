<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useListDrag } from '../composables/useListDrag'
import VInput from './VInput.vue'
import VItem from './VItem.vue'
import type { VItemData } from './vitem'

// A list of Vitems with the VInput used to add new ones. Active items can be dragged to reorder
// them inside the list; with `deleted` the list shows the recovery version of each item, cannot be
// reordered and has no input. Lists with their own way of adding (coordinates, birthdays) turn the
// input off, and the check, the editing, the dragging or the delete button too when they have no
// use for them; with `openable` a double click emits `open` so the list can edit the item in its own
// dialog. The `prefix` and default slots reach every item with its `id`.
const props = withDefaults(
  defineProps<{
    items: VItemData[]
    deleted?: boolean
    noun?: string
    placeholder?: string
    largeInput?: boolean
    withInput?: boolean
    checkable?: boolean
    editable?: boolean
    reorderable?: boolean
    openable?: boolean
    removable?: boolean
  }>(),
  { withInput: true, checkable: true, editable: true, reorderable: true, removable: true },
)

defineSlots<{
  prefix?: (props: { id: number }) => unknown
  default?: (props: { id: number }) => unknown
}>()

const emit = defineEmits<{
  toggle: [id: number]
  edit: [id: number, text: string]
  remove: [id: number]
  restore: [id: number]
  move: [id: number, beforeId: number | null]
  add: [text: string]
  open: [id: number]
}>()

const list = ref<HTMLElement | null>(null)
const byId = computed(() => new Map(props.items.map((item) => [String(item.id), item])))

const { entries, draggingId, draggingHeight, ghost, startDrag, nudge } = useListDrag({
  list,
  ids: () => props.items.map((item) => String(item.id)),
  labelOf: (id) => byId.value.get(id)?.text ?? '',
  onMove: (id, beforeId) => emit('move', Number(id), beforeId === null ? null : Number(beforeId)),
})

// Reordering moves the item's node, and the browser drops the focus of a moved node: give it back
// to the handle so the arrows can keep moving the same item.
async function nudgeKeepingFocus(id: string, direction: 'up' | 'down') {
  await nudge(id, direction === 'up' ? -1 : 1)
  await nextTick()
  list.value?.querySelector<HTMLElement>(`[data-drag-id="${id}"] .handle`)?.focus()
}
</script>

<template>
  <VInput
    v-if="!deleted && withInput"
    :placeholder="placeholder ?? 'Añadir'"
    :large="largeInput"
    @add="(text) => emit('add', text)"
  />

  <ul v-if="deleted" class="vitem-list">
    <VItem
      v-for="item in items"
      :key="item.id"
      :text="item.text"
      :noun="noun"
      deleted
      @restore="emit('restore', item.id)"
    />
  </ul>

  <ul v-else ref="list" class="vitem-list">
    <template v-for="entry in entries" :key="entry.kind === 'item' ? entry.id : 'slot'">
      <li
        v-if="entry.kind === 'placeholder'"
        class="placeholder"
        :style="{ height: `${draggingHeight}px` }"
        aria-hidden="true"
      ></li>
      <VItem
        v-else-if="byId.get(entry.id)"
        :data-drag-id="entry.id"
        :text="byId.get(entry.id)!.text"
        :completed="byId.get(entry.id)!.completed"
        :noun="noun"
        :dragging="draggingId === entry.id"
        :checkable="checkable"
        :editable="editable"
        :reorderable="reorderable"
        :openable="openable"
        :removable="removable"
        @toggle="emit('toggle', Number(entry.id))"
        @edit="(text) => emit('edit', Number(entry.id), text)"
        @remove="emit('remove', Number(entry.id))"
        @dragstart="(event, rect) => startDrag(entry.id, event, rect)"
        @move="(direction) => nudgeKeepingFocus(entry.id, direction)"
        @open="emit('open', Number(entry.id))"
      >
        <template #prefix><slot :id="Number(entry.id)" name="prefix" /></template>
        <slot :id="Number(entry.id)" />
      </VItem>
    </template>
  </ul>

  <div
    v-if="ghost"
    class="ghost"
    :class="{ settling: ghost.settling }"
    :style="{
      left: `${ghost.x}px`,
      top: `${ghost.y}px`,
      width: `${ghost.width}px`,
      height: ghost.height ? `${ghost.height}px` : undefined,
    }"
    aria-hidden="true"
  >
    {{ ghost.label }}
  </div>
</template>

<style scoped>
.vitem-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.placeholder {
  flex-shrink: 0;
  border: 2px dashed var(--color-drag);
  border-radius: var(--radius-md);
  background: var(--color-drag-fill);
}

.ghost {
  position: fixed;
  z-index: 50;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-weight: 600;
  background: var(--color-surface);
  box-shadow: var(--shadow-float);
  opacity: 0.95;
  pointer-events: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ghost.settling {
  transition: left 0.18s ease-out, top 0.18s ease-out, width 0.18s ease-out,
    height 0.18s ease-out, opacity 0.18s ease-out;
  opacity: 0.55;
}

@media (prefers-reduced-motion: reduce) {
  .ghost.settling {
    transition: none;
  }
}
</style>

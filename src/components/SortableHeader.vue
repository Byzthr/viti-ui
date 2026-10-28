<script setup lang="ts">
import { computed } from 'vue'
import type { SortDirection } from '../utils/sortRows'

const props = defineProps<{
  label: string
  // The direction when the table is sorted by this column; null when it is not.
  direction: SortDirection | null
  numeric?: boolean
}>()
const emit = defineEmits<{ sort: [] }>()

const ariaSort = computed(() => {
  if (props.direction === null) return 'none'
  return props.direction === 'asc' ? 'ascending' : 'descending'
})
</script>

<template>
  <th scope="col" :class="{ numeric }" :aria-sort="ariaSort">
    <button type="button" class="sort" :class="{ active: direction }" @click="emit('sort')">
      {{ label }}
      <svg
        class="arrow"
        :class="{ desc: direction === 'desc' }"
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  </th>
</template>

<style scoped>
.numeric {
  text-align: right;
  white-space: nowrap;
}

.sort {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

.sort:hover,
.sort.active {
  color: var(--color-primary);
}

.sort:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

.arrow {
  flex-shrink: 0;
  opacity: 0;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.sort:hover .arrow {
  opacity: 0.4;
}

.sort.active .arrow {
  opacity: 1;
}

.arrow.desc {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .arrow {
    transition: none;
  }
}
</style>

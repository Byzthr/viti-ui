import { computed, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { sortRows } from '../utils/sortRows'
import type { SortDirection, SortValue } from '../utils/sortRows'

export interface SortColumn<K extends string> {
  key: K
  label: string
  // Sizes and dates usually start from the biggest and newest.
  firstDirection?: SortDirection
  numeric?: boolean
}

// Sorting by a table's columns: clicking a column sorts by it, clicking it again flips it.
// Without an initial key the rows keep the order they came in until a column is chosen.
export function useTableSort<T, K extends string>(
  rows: MaybeRefOrGetter<readonly T[]>,
  values: Record<K, (row: T) => SortValue>,
  initial: { key: NoInfer<K>; direction: SortDirection } | null = null,
) {
  const sortKey = ref<K | null>(initial?.key ?? null)
  const sortDirection = ref<SortDirection>(initial?.direction ?? 'asc')

  function sortBy(column: SortColumn<K>) {
    if (sortKey.value === column.key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = column.key
      sortDirection.value = column.firstDirection ?? 'asc'
    }
  }

  const sorted = computed(() => {
    const key = sortKey.value as K | null
    const list = toValue(rows)
    return key === null ? [...list] : sortRows(list, values[key], sortDirection.value)
  })

  return { sortKey, sortDirection, sortBy, sorted }
}

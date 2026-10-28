import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useTableSort } from './useTableSort'
import type { SortColumn } from './useTableSort'

interface Row {
  name: string
  size: number
}

const NAME: SortColumn<'name' | 'size'> = { key: 'name', label: 'Nombre' }
const SIZE: SortColumn<'name' | 'size'> = {
  key: 'size',
  label: 'Tamaño',
  firstDirection: 'desc',
}
const VALUES = { name: (row: Row) => row.name, size: (row: Row) => row.size }

describe('useTableSort', () => {
  it('keeps the original order until a column is chosen', () => {
    const rows = ref<Row[]>([
      { name: 'b', size: 1 },
      { name: 'a', size: 2 },
    ])
    const { sorted, sortBy } = useTableSort(rows, VALUES)

    expect(sorted.value.map((row) => row.name)).toEqual(['b', 'a'])

    sortBy(NAME)
    expect(sorted.value.map((row) => row.name)).toEqual(['a', 'b'])
  })

  it('starts each column in its own direction and flips it on the second click', () => {
    const rows = [
      { name: 'a', size: 1 },
      { name: 'b', size: 2 },
    ]
    const { sorted, sortBy, sortKey, sortDirection } = useTableSort(rows, VALUES, {
      key: 'name',
      direction: 'asc',
    })

    sortBy(SIZE)
    expect(sortKey.value).toBe('size')
    expect(sortDirection.value).toBe('desc')
    expect(sorted.value.map((row) => row.name)).toEqual(['b', 'a'])

    sortBy(SIZE)
    expect(sortDirection.value).toBe('asc')
    expect(sorted.value.map((row) => row.name)).toEqual(['a', 'b'])
  })

  it('follows changes in the rows', () => {
    const rows = ref<Row[]>([{ name: 'b', size: 1 }])
    const { sorted } = useTableSort(rows, VALUES, {
      key: 'name',
      direction: 'asc',
    })

    rows.value = [...rows.value, { name: 'a', size: 2 }]

    expect(sorted.value.map((row) => row.name)).toEqual(['a', 'b'])
  })
})

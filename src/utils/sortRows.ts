export type SortDirection = 'asc' | 'desc'
export type SortValue = string | number | boolean | null | undefined

// numeric: versions, IPs and names with numbers sort as people read them (1.10 after 1.9).
const collator = new Intl.Collator('es', {
  numeric: true,
  sensitivity: 'base',
})

// Rows without a value (no size, no name...) go last whichever the direction, so sorting by
// size descending shows the biggest ones first and not the unknown ones.
export function sortRows<T>(
  rows: readonly T[],
  value: (row: T) => SortValue,
  direction: SortDirection,
): T[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = value(a)
    const right = value(b)
    if (left === right) return 0
    if (left === null || left === undefined || left === '') return 1
    if (right === null || right === undefined || right === '') return -1
    const order =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : collator.compare(String(left), String(right))
    return order * sign
  })
}

// Inserts the item `id` right before `beforeId` (or at the end when it is null). Nothing is
// swapped: only the moved item changes place. Returns null when there is nothing to do: unknown
// items, an item moved onto itself or a move that leaves the order as it was.
export function moveBefore<T extends { id: number }>(
  list: T[],
  id: number,
  beforeId: number | null,
): T[] | null {
  const moved = list.find((item) => item.id === id)
  if (!moved || beforeId === id) return null
  const others = list.filter((item) => item.id !== id)
  const at = beforeId === null ? others.length : others.findIndex((item) => item.id === beforeId)
  if (at < 0) return null
  const reordered = [...others.slice(0, at), moved, ...others.slice(at)]
  return reordered.every((item, index) => item.id === list[index].id) ? null : reordered
}

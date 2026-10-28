// Where an item goes after its completed state changed: a completed one goes last (null) and an
// unchecked one goes first. Returns undefined when it has nowhere to go. `list` already holds the
// new state.
export function beforeIdAfterToggle(
  list: { id: number; completed: boolean }[],
  id: number,
): number | null | undefined {
  const item = list.find((entry) => entry.id === id)
  if (!item) return undefined
  if (item.completed) return null
  return list.find((entry) => entry.id !== id)?.id
}

// Adds a new item right above the completed ones, the same place the server stores it in.
export function insertBeforeCompleted<T extends { completed: boolean }>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.completed)
  return index === -1 ? [...list, item] : [...list.slice(0, index), item, ...list.slice(index)]
}

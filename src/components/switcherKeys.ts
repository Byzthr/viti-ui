export type Orientation = 'horizontal' | 'vertical'

const STEPS: Record<Orientation, Record<string, number>> = {
  horizontal: { ArrowLeft: -1, ArrowRight: 1 },
  vertical: { ArrowUp: -1, ArrowDown: 1 },
}

// The tab a key moves to in a tablist of `count` tabs, or null if the key does not move.
export function nextIndex(
  current: number,
  key: string,
  count: number,
  orientation: Orientation,
): number | null {
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  const step = STEPS[orientation][key]
  if (step === undefined) return null
  return (current + step + count) % count
}

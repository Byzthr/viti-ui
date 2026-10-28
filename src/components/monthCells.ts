// The days of a month as Monday-first week rows, padded with null outside the month, so they
// render as a regular 7-column grid.
export function monthWeeks(year: number, month: number): (Date | null)[][] {
  const leading = (new Date(year, month, 1).getDay() + 6) % 7
  const total = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: total }, (_, index) => new Date(year, month, index + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (Date | null)[][] = []
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))
  return weeks
}

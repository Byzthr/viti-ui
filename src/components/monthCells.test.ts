import { describe, expect, it } from 'vitest'
import { monthWeeks } from './monthCells'

describe('monthWeeks', () => {
  it('starts on Monday and pads the days outside the month', () => {
    // October 2026 starts on a Thursday and ends on a Saturday.
    const weeks = monthWeeks(2026, 9)

    expect(weeks).toHaveLength(5)
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null])
    expect(weeks[0][3]).toEqual(new Date(2026, 9, 1))
    expect(weeks[4][5]).toEqual(new Date(2026, 9, 31))
    expect(weeks[4][6]).toBeNull()
  })

  it('fits a month starting on Monday without padding before it', () => {
    // June 2026 starts on a Monday.
    expect(monthWeeks(2026, 5)[0][0]).toEqual(new Date(2026, 5, 1))
  })
})

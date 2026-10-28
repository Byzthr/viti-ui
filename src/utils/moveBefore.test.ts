import { describe, expect, it } from 'vitest'
import { moveBefore } from './moveBefore'

const list = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
const ids = (result: { id: number }[] | null) => result?.map((item) => item.id)

describe('moveBefore', () => {
  it('inserts the item before another one without swapping', () => {
    expect(ids(moveBefore(list, 4, 2))).toEqual([1, 4, 2, 3])
    expect(ids(moveBefore(list, 1, 3))).toEqual([2, 1, 3, 4])
  })

  it('moves the item to the end when nothing follows it', () => {
    expect(ids(moveBefore(list, 1, null))).toEqual([2, 3, 4, 1])
  })

  it('returns null when the order would not change', () => {
    expect(moveBefore(list, 2, 3)).toBeNull()
    expect(moveBefore(list, 4, null)).toBeNull()
    expect(moveBefore(list, 1, 2)).toBeNull()
  })

  it('returns null for itself or unknown items', () => {
    expect(moveBefore(list, 2, 2)).toBeNull()
    expect(moveBefore(list, 9, null)).toBeNull()
    expect(moveBefore(list, 1, 9)).toBeNull()
  })

  it('does not modify the original list', () => {
    moveBefore(list, 4, 1)
    expect(ids(list)).toEqual([1, 2, 3, 4])
  })
})

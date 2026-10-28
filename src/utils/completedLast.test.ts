import { describe, expect, it } from 'vitest'
import { beforeIdAfterToggle, insertBeforeCompleted } from './completedLast'

const item = (id: number, completed = false) => ({ id, completed })

describe('beforeIdAfterToggle', () => {
  it('sends a completed item to the end', () => {
    expect(beforeIdAfterToggle([item(1, true), item(2)], 1)).toBeNull()
  })

  it('puts an unchecked item before the first one of the list', () => {
    expect(beforeIdAfterToggle([item(2), item(3, true), item(1)], 1)).toBe(2)
  })

  it('has nowhere to send an unchecked item that is alone', () => {
    expect(beforeIdAfterToggle([item(1)], 1)).toBeUndefined()
  })

  it('ignores unknown items', () => {
    expect(beforeIdAfterToggle([item(1)], 9)).toBeUndefined()
  })
})

describe('insertBeforeCompleted', () => {
  it('puts the new item right above the completed ones', () => {
    expect(insertBeforeCompleted([item(1), item(2, true), item(3, true)], item(4))).toEqual([
      item(1),
      item(4),
      item(2, true),
      item(3, true),
    ])
  })

  it('adds the new item at the end when none is completed', () => {
    expect(insertBeforeCompleted([item(1)], item(2))).toEqual([item(1), item(2)])
  })
})

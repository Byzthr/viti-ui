import { describe, expect, it } from 'vitest'
import { nextIndex } from './switcherKeys'

describe('nextIndex', () => {
  it('moves with the arrows of its orientation and wraps around', () => {
    expect(nextIndex(0, 'ArrowRight', 3, 'horizontal')).toBe(1)
    expect(nextIndex(2, 'ArrowRight', 3, 'horizontal')).toBe(0)
    expect(nextIndex(0, 'ArrowLeft', 3, 'horizontal')).toBe(2)
    expect(nextIndex(1, 'ArrowDown', 3, 'vertical')).toBe(2)
  })

  it('ignores the arrows of the other orientation', () => {
    expect(nextIndex(1, 'ArrowDown', 3, 'horizontal')).toBeNull()
  })

  it('jumps to the first and last with Home and End', () => {
    expect(nextIndex(1, 'Home', 3, 'vertical')).toBe(0)
    expect(nextIndex(0, 'End', 3, 'horizontal')).toBe(2)
  })

  it('ignores other keys', () => {
    expect(nextIndex(0, 'a', 3, 'horizontal')).toBeNull()
  })
})

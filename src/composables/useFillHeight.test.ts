import { describe, expect, it } from 'vitest'
import { fillHeight } from './useFillHeight'

describe('fillHeight', () => {
  it('fills the window from where the element starts, leaving the bottom margin', () => {
    expect(fillHeight(900, 200, 32, 320)).toBe(668)
  })

  it('never goes below the minimum on a short window', () => {
    expect(fillHeight(500, 300, 32, 320)).toBe(320)
  })

  it('rounds down so a fraction never leaves a pixel to scroll', () => {
    expect(fillHeight(900, 200, 47.6, 320)).toBe(652)
  })
})

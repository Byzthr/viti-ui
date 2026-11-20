import { describe, expect, it } from 'vitest'
import { clampWidth } from './paneSplitter'

describe('clampWidth', () => {
  it('adds the delta to the start width', () => {
    expect(clampWidth(240, 50, 160, 480)).toBe(290)
  })

  it('never goes below the minimum', () => {
    expect(clampWidth(240, -200, 160, 480)).toBe(160)
  })

  it('never goes above the maximum', () => {
    expect(clampWidth(240, 400, 160, 480)).toBe(480)
  })

  it('rounds to whole pixels', () => {
    expect(clampWidth(240, 0.6, 160, 480)).toBe(241)
  })
})

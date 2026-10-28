import { describe, expect, it } from 'vitest'
import { resolveLook } from './useLook'

describe('resolveLook', () => {
  it('keeps the saved look', () => {
    expect(resolveLook('minimal')).toBe('minimal')
    expect(resolveLook('hand-drawn')).toBe('hand-drawn')
  })

  it('falls back to the default look when none was chosen', () => {
    expect(resolveLook(null)).toBe('twilight')
  })

  it('ignores a saved look the app no longer has', () => {
    expect(resolveLook('vaporwave')).toBe('twilight')
  })
})

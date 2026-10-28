import { describe, expect, it } from 'vitest'
import { resolveTheme } from './useTheme'

describe('resolveTheme', () => {
  it('follows the system until a theme is chosen', () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
  })

  it('keeps the chosen theme whatever the system says', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('ignores a saved value it does not know', () => {
    expect(resolveTheme('sepia', true)).toBe('dark')
  })
})

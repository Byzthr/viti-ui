import { describe, expect, it } from 'vitest'
import { withPlaceholder } from './useListDrag'

const shape = (entries: ReturnType<typeof withPlaceholder>) =>
  entries.map((entry) => (entry.kind === 'placeholder' ? '_' : entry.id)).join(' ')

describe('withPlaceholder', () => {
  it('shows no placeholder when nothing is dragged', () => {
    expect(shape(withPlaceholder(['a', 'b', 'c'], null, null))).toBe('a b c')
  })

  it('puts the placeholder before the item that currently holds the slot', () => {
    expect(shape(withPlaceholder(['a', 'b', 'c'], 'a', 1))).toBe('a b _ c')
  })

  it('counts only the items that stay when the dragged one is in the list', () => {
    // b is being dragged: the rest is [a, c], so slot 1 is right before c (b stays hidden).
    expect(shape(withPlaceholder(['a', 'b', 'c'], 'b', 1))).toBe('a b _ c')
    expect(shape(withPlaceholder(['a', 'b', 'c'], 'b', 0))).toBe('_ a b c')
  })

  it('puts the placeholder at the end when the slot is past the last item', () => {
    expect(shape(withPlaceholder(['a', 'b', 'c'], 'a', 2))).toBe('a b c _')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { closeContextMenu, fitInViewport, openContextMenu, useContextMenu } from './useContextMenu'

function fakeEvent(options: { x?: number; y?: number; prevented?: boolean; inTextField?: boolean } = {}) {
  const event = {
    clientX: options.x ?? 100,
    clientY: options.y ?? 200,
    defaultPrevented: options.prevented ?? false,
    preventDefault: vi.fn(() => (event.defaultPrevented = true)),
    target: { closest: () => (options.inTextField ? {} : null) } as unknown as EventTarget,
    currentTarget: {
      getBoundingClientRect: () => ({ left: 40, top: 60, height: 20 }),
    } as unknown as EventTarget,
  }
  return event
}

const items = [
  { id: 'edit' as const, label: 'Editar' },
  { id: 'remove' as const, label: 'Eliminar', disabled: true },
]

afterEach(closeContextMenu)

describe('openContextMenu', () => {
  it('opens at the pointer instead of the browser menu', () => {
    const event = fakeEvent()
    openContextMenu(event, items, () => {})
    expect(event.preventDefault).toHaveBeenCalled()
    expect(useContextMenu().current.value).toMatchObject({ x: 100, y: 200, items })
  })

  it('lets an inner element that already opened its menu win', () => {
    openContextMenu(fakeEvent({ prevented: true }), items, () => {})
    expect(useContextMenu().current.value).toBeNull()
  })

  it('keeps the browser menu on text fields', () => {
    const event = fakeEvent({ inTextField: true })
    openContextMenu(event, items, () => {})
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(useContextMenu().current.value).toBeNull()
  })

  it('keeps the browser menu when no option is enabled', () => {
    openContextMenu(fakeEvent(), [{ id: 'remove', label: 'Eliminar', disabled: true }], () => {})
    expect(useContextMenu().current.value).toBeNull()
  })

  it('places it at the element when opened from the keyboard', () => {
    openContextMenu(fakeEvent({ x: 0, y: 0 }), items, () => {})
    expect(useContextMenu().current.value).toMatchObject({ x: 56, y: 70 })
  })

  it('runs the chosen option but never a disabled one', () => {
    const onSelect = vi.fn()
    openContextMenu(fakeEvent(), items, onSelect)
    const { select } = useContextMenu().current.value!
    select('remove')
    select('unknown')
    select('edit')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith('edit')
  })
})

describe('fitInViewport', () => {
  it('opens after the pointer when it fits', () => {
    expect(fitInViewport(100, 100, 200, 150, 1000, 800)).toEqual({ left: 100, top: 100 })
  })

  it('opens before the pointer near the right and bottom edges', () => {
    expect(fitInViewport(950, 750, 200, 150, 1000, 800)).toEqual({ left: 750, top: 600 })
  })

  it('stays inside the window when it fits on neither side', () => {
    expect(fitInViewport(100, 100, 200, 790, 1000, 800)).toEqual({ left: 100, top: 8 })
  })
})

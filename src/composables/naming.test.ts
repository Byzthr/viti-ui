import { describe, expect, it } from 'vitest'

// Every composable the library exports is named vUse..., so the apps can tell them apart from
// their own use... composables.
const modules = import.meta.glob(['./*.ts', '!./*.test.ts'], { eager: true })

function nameOf(path: string): string {
  return path.replace(/^\.\/|\.ts$/g, '')
}

describe('composable naming', () => {
  it('every composable file starts with vUse', () => {
    const names = Object.keys(modules).map(nameOf)
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^vUse[A-Z]/)
  })

  it('every composable file exports a function with its own name', () => {
    for (const [path, mod] of Object.entries(modules)) {
      expect(typeof (mod as Record<string, unknown>)[nameOf(path)]).toBe('function')
    }
  })

  it('no composable file still exports an old use... name', () => {
    for (const mod of Object.values(modules)) {
      const leftovers = Object.keys(mod as Record<string, unknown>).filter((key) =>
        /^use[A-Z]/.test(key),
      )
      expect(leftovers).toEqual([])
    }
  })
})

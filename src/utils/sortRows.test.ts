import { describe, expect, it } from 'vitest'
import { sortRows } from './sortRows'

interface Row {
  name: string
  size?: number | null
  version?: string
}

const names = (rows: Row[]) => rows.map((row) => row.name)

describe('sortRows', () => {
  it('sorts names ignoring case and reading numbers as numbers', () => {
    const rows = [{ name: 'git' }, { name: 'App 10' }, { name: 'App 9' }, { name: 'Zoom' }]

    expect(names(sortRows(rows, (row) => row.name, 'asc'))).toEqual([
      'App 9',
      'App 10',
      'git',
      'Zoom',
    ])
    expect(names(sortRows(rows, (row) => row.name, 'desc'))).toEqual([
      'Zoom',
      'git',
      'App 10',
      'App 9',
    ])
  })

  it('sorts numbers as numbers and keeps missing values last in both directions', () => {
    const rows = [
      { name: 'small', size: 5 },
      { name: 'unknown', size: null },
      { name: 'big', size: 500 },
      { name: 'medium', size: 50 },
    ]

    expect(names(sortRows(rows, (row) => row.size, 'desc'))).toEqual([
      'big',
      'medium',
      'small',
      'unknown',
    ])
    expect(names(sortRows(rows, (row) => row.size, 'asc'))).toEqual([
      'small',
      'medium',
      'big',
      'unknown',
    ])
  })

  it('sorts versions and IPs naturally', () => {
    const versions = [
      { name: 'a', version: '1.10.0' },
      { name: 'b', version: '1.9.2' },
    ]
    const ips = [{ name: '192.168.1.10' }, { name: '192.168.1.9' }]

    expect(names(sortRows(versions, (row) => row.version, 'asc'))).toEqual(['b', 'a'])
    expect(names(sortRows(ips, (row) => row.name, 'asc'))).toEqual(['192.168.1.9', '192.168.1.10'])
  })

  it('does not change the list it receives', () => {
    const rows = [{ name: 'b' }, { name: 'a' }]

    sortRows(rows, (row) => row.name, 'asc')

    expect(names(rows)).toEqual(['b', 'a'])
  })
})

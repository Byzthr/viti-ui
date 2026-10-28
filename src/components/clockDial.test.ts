import { describe, expect, it } from 'vitest'
import {
  CENTER,
  dialLabels,
  hourPoint,
  INNER_RADIUS,
  minutePoint,
  OUTER_RADIUS,
  pointAt,
  valueAt,
} from './clockDial'

describe('points on the face', () => {
  it('puts 0° at twelve o’clock and turns clockwise', () => {
    const top = pointAt(0, OUTER_RADIUS)
    const right = pointAt(90, OUTER_RADIUS)
    expect(top.x).toBeCloseTo(CENTER)
    expect(top.y).toBeCloseTo(CENTER - OUTER_RADIUS)
    expect(right.x).toBeCloseTo(CENTER + OUTER_RADIUS)
    expect(right.y).toBeCloseTo(CENTER)
  })

  it('places 1–12 on the outer ring and 00, 13–23 on the inner one', () => {
    expect(hourPoint(12).y).toBeCloseTo(CENTER - OUTER_RADIUS)
    expect(hourPoint(0).y).toBeCloseTo(CENTER - INNER_RADIUS)
    expect(hourPoint(3).x).toBeCloseTo(CENTER + OUTER_RADIUS)
    expect(hourPoint(15).x).toBeCloseTo(CENTER + INNER_RADIUS)
  })

  it('places the minutes around the outer ring', () => {
    expect(minutePoint(30).y).toBeCloseTo(CENTER + OUTER_RADIUS)
  })
})

describe('dialLabels', () => {
  it('labels the 24 hours, padding the inner ones', () => {
    const labels = dialLabels('hours')
    expect(labels).toHaveLength(24)
    expect(labels.find((label) => label.value === 0)).toMatchObject({ text: '00', inner: true })
    expect(labels.find((label) => label.value === 9)).toMatchObject({ text: '9', inner: false })
  })

  it('labels every five minutes', () => {
    expect(dialLabels('minutes').map((label) => label.text)).toEqual([
      '00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55',
    ])
  })
})

describe('valueAt', () => {
  it('reads the hour of the ring the point is on', () => {
    expect(valueAt('hours', hourPoint(9), 5)).toBe(9)
    expect(valueAt('hours', hourPoint(21), 5)).toBe(21)
    expect(valueAt('hours', hourPoint(12), 5)).toBe(12)
    expect(valueAt('hours', hourPoint(0), 5)).toBe(0)
  })

  it('rounds the minutes to the step', () => {
    expect(valueAt('minutes', minutePoint(17), 5)).toBe(15)
    expect(valueAt('minutes', minutePoint(18), 5)).toBe(20)
    expect(valueAt('minutes', minutePoint(17), 1)).toBe(17)
  })

  it('wraps a minute near twelve o’clock back to 00', () => {
    expect(valueAt('minutes', minutePoint(59), 5)).toBe(0)
  })
})

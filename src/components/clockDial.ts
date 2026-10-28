// Geometry of TimePicker's clock face, in the coordinates of its 200×200 SVG viewBox: 0° is
// twelve o'clock and angles grow clockwise. Hours use two rings, like Material's 24-hour dial:
// 1–12 on the outer one and 00, 13–23 on the inner one.

export type DialMode = 'hours' | 'minutes'

export const CENTER = 100
export const OUTER_RADIUS = 80
export const INNER_RADIUS = 54

export interface DialPoint {
  x: number
  y: number
}

export function pointAt(angle: number, radius: number): DialPoint {
  const radians = (angle * Math.PI) / 180
  return { x: CENTER + radius * Math.sin(radians), y: CENTER - radius * Math.cos(radians) }
}

const isInnerHour = (hour: number) => hour === 0 || hour > 12

export function hourPoint(hour: number): DialPoint {
  return pointAt((hour % 12) * 30, isInnerHour(hour) ? INNER_RADIUS : OUTER_RADIUS)
}

export function minutePoint(minute: number): DialPoint {
  return pointAt(minute * 6, OUTER_RADIUS)
}

export interface DialLabel {
  value: number
  text: string
  inner: boolean
  point: DialPoint
}

// The labels drawn on the face for each mode, with where each one goes.
export function dialLabels(mode: DialMode): DialLabel[] {
  if (mode === 'hours') {
    return Array.from({ length: 24 }, (_, hour) => ({
      value: hour,
      text: isInnerHour(hour) ? String(hour).padStart(2, '0') : String(hour),
      inner: isInnerHour(hour),
      point: hourPoint(hour),
    }))
  }
  // Every five minutes are labelled whatever the step; finer steps are picked between them.
  return Array.from({ length: 12 }, (_, index) => ({
    value: index * 5,
    text: String(index * 5).padStart(2, '0'),
    inner: false,
    point: minutePoint(index * 5),
  }))
}

// The value under a point of the face: the nearest hour (picking the ring by how far the point
// is from the center) or the nearest minute that is a multiple of `step`.
export function valueAt(mode: DialMode, point: DialPoint, step: number): number {
  const dx = point.x - CENTER
  const dy = point.y - CENTER
  const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360

  if (mode === 'minutes') return (Math.round(angle / 6 / step) * step) % 60

  const position = Math.round(angle / 30) % 12
  const inner = Math.hypot(dx, dy) < (INNER_RADIUS + OUTER_RADIUS) / 2
  if (inner) return position === 0 ? 0 : position + 12
  return position === 0 ? 12 : position
}

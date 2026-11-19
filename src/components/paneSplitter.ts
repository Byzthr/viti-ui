// The width a panel gets after its border moves `delta` px, kept inside [min, max].
export function clampWidth(start: number, delta: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(start + delta)))
}

// Local date as `dd/mm/yyyy`, the format every date is shown in, regardless of browser locale.
export function toDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).padStart(4, '0')
  return `${day}/${month}/${year}`
}

const DISPLAY_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/

// Parses a strict `dd/mm/yyyy` string. Returns null for the wrong shape and for a shape that's
// right but not a real date (31/02/2026), instead of letting it silently roll over to March.
export function parseDisplayDate(text: string): Date | null {
  const match = DISPLAY_DATE_RE.exec(text)
  if (!match) return null
  const [, dayText, monthText, yearText] = match
  const day = Number(dayText)
  const month = Number(monthText)
  const year = Number(yearText)
  const date = new Date(year, month - 1, day)
  const isReal = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return isReal ? date : null
}

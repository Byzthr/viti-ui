// An option of a menu. `icon` is the `d` of a 24×24 stroked SVG path drawn before its label.
export interface MenuItem<T extends string = string> {
  id: T
  label: string
  icon?: string
  danger?: boolean
  disabled?: boolean
}

// The icons the right-click menus share, so the same action looks the same everywhere.
export const MENU_ICONS = {
  check: 'M20 6 9 17l-5-5',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  open: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  up: 'M12 19V5M5 12l7-7 7 7',
  down: 'M12 5v14M19 12l-7 7-7-7',
  remove: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6',
  restore: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
} as const

import { ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'viti-theme'

// A theme chosen in the app wins; until there is one, the system's setting decides.
export function resolveTheme(saved: string | null, systemDark: boolean): Theme {
  if (saved === 'light' || saved === 'dark') return saved
  return systemDark ? 'dark' : 'light'
}

const theme = ref<Theme>('light')
let started = false

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function save(value: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Without storage the choice lasts until the page is closed.
  }
}

// style.css switches its colors on this attribute.
function apply(value: Theme) {
  theme.value = value
  document.documentElement.dataset.theme = value
}

// Called once before the app mounts, so the first paint already has the right colors.
export function initTheme() {
  if (started) return
  started = true
  const system = window.matchMedia('(prefers-color-scheme: dark)')
  apply(resolveTheme(readSaved(), system.matches))
  system.addEventListener('change', (event) => {
    if (!readSaved()) apply(event.matches ? 'dark' : 'light')
  })
}

export function useTheme() {
  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    save(next)
    apply(next)
  }

  return { theme, toggle }
}

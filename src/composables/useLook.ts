import { ref } from 'vue'

// The app's looks: the default one in style.css and the others in styles/, each scoped to its
// data-style. Light and dark (useTheme) work the same in every one. The emoji stands for it in
// the picker: drawn in one color, so each ends in U+FE0E (the text, not the color, version) and
// has to be one that Segoe UI Symbol draws.
export const LOOKS = [
  { id: 'twilight', label: 'Crepúsculo', emoji: '🌆︎' },
  { id: 'hand-drawn', label: 'A mano', emoji: '✏︎' },
  { id: 'minimal', label: 'Minimalista', emoji: '◻︎' },
  { id: 'brutalist', label: 'Neobrutalista', emoji: '🔳︎' },
  { id: 'editorial', label: 'Revista', emoji: '📰︎' },
] as const

export type Look = (typeof LOOKS)[number]['id']

const DEFAULT_LOOK: Look = 'twilight'
const STORAGE_KEY = 'viti-look'

// The saved look if it is one the app still has; the default one otherwise.
export function resolveLook(saved: string | null): Look {
  return LOOKS.find((look) => look.id === saved)?.id ?? DEFAULT_LOOK
}

const look = ref<Look>(DEFAULT_LOOK)
let started = false

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function save(value: Look) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Without storage the choice lasts until the page is closed.
  }
}

// The stylesheets of styles/ switch on this attribute; the default look needs none.
function apply(value: Look) {
  look.value = value
  if (value === DEFAULT_LOOK) delete document.documentElement.dataset.style
  else document.documentElement.dataset.style = value
}

// Called once before the app mounts, so the first paint already has the right look.
export function initLook() {
  if (started) return
  started = true
  apply(resolveLook(readSaved()))
}

export function useLook() {
  function select(value: Look) {
    save(value)
    apply(value)
  }

  return { look, select }
}

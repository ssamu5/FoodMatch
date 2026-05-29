import { useCallback, useEffect, useState } from 'react'

/** What the user picked. Persisted. */
export type ThemeMode = 'light' | 'dark' | 'system'
/** What is actually applied to the DOM right now. */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fm.theme'
const CYCLE: ThemeMode[] = ['light', 'dark', 'system']

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/** Resolve a mode to the concrete theme that should be on screen. */
function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') return prefersDark() ? 'dark' : 'light'
  return mode
}

/** Read the user's stored preference. Falls back to 'system'. */
function readMode(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* localStorage may be blocked */
  }
  // Pre-paint script mirrors the resolved mode onto <html data-mode>.
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-mode')
    if (attr === 'light' || attr === 'dark' || attr === 'system') return attr
  }
  return 'system'
}

function applyTheme(theme: Theme, mode: ThemeMode) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  root.setAttribute('data-theme', theme)
  root.setAttribute('data-mode', mode)
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => readMode())
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme(readMode()))

  const setMode = useCallback((next: ThemeMode) => {
    const nextTheme = resolveTheme(next)
    applyTheme(nextTheme, next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage may be blocked */
    }
    setModeState(next)
    setThemeState(nextTheme)
  }, [])

  const cycle = useCallback(() => {
    const i = CYCLE.indexOf(readMode())
    const next = CYCLE[(i + 1) % CYCLE.length]
    setMode(next)
  }, [setMode])

  // While in 'system' mode, follow OS preference changes live.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (readMode() !== 'system') return
      const next: Theme = mq.matches ? 'dark' : 'light'
      applyTheme(next, 'system')
      setThemeState(next)
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // Cross-tab sync: mirror a preference change made in another tab.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return
      const v = e.newValue
      if (v === 'light' || v === 'dark' || v === 'system') {
        const nextTheme = resolveTheme(v)
        applyTheme(nextTheme, v)
        setModeState(v)
        setThemeState(nextTheme)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { mode, theme, setMode, cycle }
}

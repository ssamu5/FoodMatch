import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fm.theme'

/** Read the currently-applied theme. Source of truth is the .dark class on
 *  <html>, which the pre-paint script in index.html sets before mount. */
function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  root.setAttribute('data-theme', theme)
}

function userHasExplicitChoice(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark'
  } catch {
    return false
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme())

  // Persist + apply on change
  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage may be blocked */
    }
    setThemeState(next)
  }, [])

  const toggle = useCallback(() => {
    setTheme(readTheme() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  // If the user hasn't picked explicitly, follow OS changes live.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      if (userHasExplicitChoice()) return
      const next: Theme = e.matches ? 'dark' : 'light'
      applyTheme(next)
      setThemeState(next)
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // Cross-tab sync: if the user toggles in one tab, mirror it in others.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return
      const v = e.newValue
      if (v === 'light' || v === 'dark') {
        applyTheme(v)
        setThemeState(v)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { theme, setTheme, toggle }
}

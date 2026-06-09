import { useTheme, type ThemeMode } from '../lib/theme'
import { track } from '../lib/analytics'
import { useT } from '../lib/i18n'

interface ThemeToggleProps {
  className?: string
}

// Cycle order and the translation key for "what tapping does next".
const NEXT: Record<ThemeMode, { next: ThemeMode; label: string }> = {
  light: { next: 'dark', label: 'theme.switchToDark' },
  dark: { next: 'system', label: 'theme.switchToSystem' },
  system: { next: 'light', label: 'theme.switchToLight' },
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, cycle } = useTheme()
  const { t } = useT()
  const { next, label } = NEXT[mode]

  return (
    <button
      type="button"
      onClick={() => {
        cycle()
        try {
          track('theme_changed', { to: next })
        } catch {
          /* analytics is best-effort */
        }
      }}
      aria-label={t(label)}
      title={t(label)}
      className={[
        'inline-flex h-9 w-9 items-center justify-center rounded-full',
        'border border-tinta/15 bg-paper/60 text-tinta',
        'transition hover:bg-creamy hover:border-tinta/30',
        'active:scale-95',
        className || '',
      ].join(' ')}
    >
      {mode === 'light' && <SunIcon className="h-4 w-4" />}
      {mode === 'dark' && <MoonIcon className="h-4 w-4" />}
      {mode === 'system' && <MonitorIcon className="h-4 w-4" />}
    </button>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
    </svg>
  )
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}

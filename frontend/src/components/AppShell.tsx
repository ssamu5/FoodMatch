import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { useT } from '../lib/i18n'

interface AppShellProps {
  children: ReactNode
  hideNav?: boolean
  headerSlot?: ReactNode
  fullBleed?: boolean
}

export default function AppShell({
  children,
  hideNav,
  headerSlot,
  fullBleed,
}: AppShellProps) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const { t } = useT()

  return (
    <div className="relative min-h-full">
      <header className="relative z-20 safe-top">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link to="/" className="group inline-flex items-center gap-2 rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomate/50" aria-label="FoodMatch home">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-tomate/15 ring-1 ring-tomate/40">
              <span className="h-2 w-2 rounded-full bg-tomate shadow-glow" />
            </span>
            <span className="font-display text-[19px] font-bold tracking-tight text-tinta">
              food<span className="text-tomate italic">match</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {headerSlot}
            {!isHome && (
              <Link to="/restaurants" className="hidden text-xs text-tinta/70 hover:text-tinta sm:inline-block">
                {t('common.forRestaurants')}
              </Link>
            )}
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        className={
          fullBleed
            ? 'relative z-10'
            : 'relative z-10 mx-auto max-w-md px-5 pb-28 pt-2'
        }
      >
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  )
}

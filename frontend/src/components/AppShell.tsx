import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'

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

  return (
    <div className="relative min-h-full">
      <header className="relative z-20 safe-top">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <Link to="/" className="group inline-flex items-center gap-2" aria-label="FoodMatch home">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime/20 ring-1 ring-lime/30">
              <span className="h-2 w-2 rounded-full bg-lime shadow-glow" />
            </span>
            <span className="font-display text-[17px] font-semibold tracking-tight text-cream">
              food<span className="text-lime">match</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {headerSlot}
            {!isHome && (
              <Link to="/restaurants" className="hidden text-xs text-ink-200 hover:text-cream sm:inline-block">
                For restaurants
              </Link>
            )}
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

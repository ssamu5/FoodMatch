import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Discover', icon: SearchIcon },
  { to: '/ask', label: 'Ask', icon: SparkIcon },
  { to: '/saved', label: 'Saved', icon: BookmarkIcon },
  { to: '/profile', label: 'You', icon: UserIcon },
] as const

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-tinta bg-paper/95 backdrop-blur-md safe-bottom"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pt-2">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <li key={l.to} className="flex-1">
              <NavLink
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium',
                    isActive
                      ? 'text-tomate'
                      : 'text-tinta/70 hover:text-tinta',
                  ].join(' ')
                }
              >
                <Icon className="h-5 w-5" />
                <span>{l.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// Lightweight inline icons (stroke-based, neutral)

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}
function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  )
}
function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 4h12v17l-6-4-6 4z" />
    </svg>
  )
}
function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8.5" r="4.5" />
      <path d="M3.5 21c.8-4.5 4.4-7.5 8.5-7.5s7.7 3 8.5 7.5" />
    </svg>
  )
}

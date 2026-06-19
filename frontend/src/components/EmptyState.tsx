interface EmptyStateProps {
  title: string
  hint?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass px-6 py-12 text-center">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-tomate/12 ring-1 ring-tomate/40 text-tomate">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </span>
      <h3 className="font-display text-[16px] font-semibold text-tinta">{title}</h3>
      {hint && <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-tinta/70">{hint}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-ghost mt-4 px-4 text-[12px]">
          {action.label}
        </button>
      )}
    </div>
  )
}

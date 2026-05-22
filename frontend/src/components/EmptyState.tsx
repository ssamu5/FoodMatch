interface EmptyStateProps {
  title: string
  hint?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass px-6 py-12 text-center">
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-tomate/12 ring-1 ring-tomate/40">
        <span className="block h-2 w-2 rounded-full bg-tomate shadow-glow animate-pulse-soft" />
      </span>
      <h3 className="font-display text-[16px] font-semibold text-tinta">{title}</h3>
      {hint && <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-tinta/70">{hint}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-ghost mt-4 h-9 px-4 text-[12px]">
          {action.label}
        </button>
      )}
    </div>
  )
}

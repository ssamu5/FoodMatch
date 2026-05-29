import { useState, type FormEvent, type KeyboardEvent } from 'react'

interface PromptComposerProps {
  initialValue?: string
  placeholder?: string
  cta?: string
  starterChips?: Array<{ label: string; query: string }>
  refinementChips?: string[]
  onSubmit: (value: string) => void
  onRefine?: (refinement: string) => void
  autoFocus?: boolean
  compact?: boolean
}

export default function PromptComposer({
  initialValue = '',
  placeholder = 'What do you feel like eating?',
  cta = 'Find my match',
  starterChips,
  refinementChips,
  onSubmit,
  onRefine,
  autoFocus,
  compact,
}: PromptComposerProps) {
  const [value, setValue] = useState(initialValue)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const v = value.trim()
    if (!v) return
    onSubmit(v)
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const v = value.trim()
      if (!v) return
      onSubmit(v)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={[
        'liquid-input rounded-3xl px-4 pb-2 pt-3.5',
        compact ? 'min-h-[64px]' : 'min-h-[92px]',
      ].join(' ')}>
        <textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          rows={compact ? 1 : 2}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-[17px] leading-snug text-tinta placeholder:text-tinta/50 focus:outline-none"
        />

        <div className="flex items-center justify-between pb-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-tinta/50">
            <span className="h-1.5 w-1.5 rounded-full bg-tomate" aria-hidden="true" />
            FoodMatch · Valencia
          </span>
          <button
            type="submit"
            disabled={!value.trim()}
            className="btn-lime h-9 px-4 text-[13px]"
          >
            {cta}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {starterChips && starterChips.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
          {starterChips.map((c) => (
            <button
              key={c.label}
              type="button"
              className="chip"
              onClick={() => {
                setValue(c.query)
                onSubmit(c.query)
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {refinementChips && refinementChips.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
          {refinementChips.map((r) => (
            <button
              key={r}
              type="button"
              className="chip"
              onClick={() => onRefine?.(r)}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}

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
      <div className="liquid-input flex items-end gap-2 rounded-3xl px-4 py-3">
        <textarea
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          rows={compact ? 1 : 2}
          placeholder={placeholder}
          className="min-w-0 flex-1 resize-none bg-transparent py-1.5 text-[16px] leading-snug text-tinta placeholder:text-tinta/45 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label={cta}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tomate text-cream transition enabled:hover:bg-tomateDeep enabled:active:scale-95 disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {starterChips && starterChips.length > 0 && (
        <div className="flex flex-wrap gap-2 py-1">
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

import { useLang, useT } from '../lib/i18n'

interface LanguageToggleProps {
  className?: string
}

export default function LanguageToggle({ className }: LanguageToggleProps) {
  const { lang, setLang } = useLang()
  const { t } = useT()
  const next = lang === 'es' ? 'en' : 'es'
  const aria = next === 'en' ? t('language.switchToEnglish') : t('language.switchToSpanish')
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={aria}
      title={aria}
      className={[
        'inline-flex h-9 items-center justify-center rounded-full px-3',
        'border border-tinta/15 bg-paper/60 text-tinta text-xs font-semibold',
        'transition hover:bg-creamy hover:border-tinta/30 active:scale-95',
        className || '',
      ].join(' ')}
    >
      {lang.toUpperCase()}
    </button>
  )
}

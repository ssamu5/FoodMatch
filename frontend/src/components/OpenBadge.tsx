import type { Restaurant } from '../types/restaurant'
import { getOpenStatus } from '../lib/ranking'
import { useT } from '../lib/i18n'

interface OpenBadgeProps {
  restaurant: Restaurant
  /** Style for placement over a dark image gradient (uses cream text). */
  onImage?: boolean
  className?: string
}

/**
 * Open / closed status pill. Renders nothing when the restaurant has no
 * opening data, so we never show a misleading "Open".
 */
export default function OpenBadge({ restaurant, onImage, className }: OpenBadgeProps) {
  const status = getOpenStatus(restaurant)
  const { t } = useT()
  if (status.state === 'unknown') return null

  let dot: string
  let text: string
  let tone: string

  if (status.state === 'open') {
    if (status.closesSoon) {
      dot = 'bg-mostaza'
      text = t('common.closesSoon')
      tone = onImage ? 'text-cream' : 'text-tinta'
    } else {
      dot = 'bg-fresco'
      text = t('common.open')
      tone = onImage ? 'text-cream' : 'text-tinta'
    }
  } else {
    dot = onImage ? 'bg-cream/50' : 'bg-tinta/30'
    text = status.opensSoon ? t('common.opensSoon') : t('common.closed')
    tone = onImage ? 'text-cream/85' : 'text-tinta/55'
  }

  return (
    <span className={['inline-flex items-center gap-1 text-[11px] font-medium', tone, className || ''].join(' ')}>
      <span className={['h-1.5 w-1.5 rounded-full', dot].join(' ')} aria-hidden="true" />
      {text}
    </span>
  )
}

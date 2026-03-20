import { IntentType } from '@/types/email'
import { cn } from '@/lib/utils'

const intentConfig: Record<IntentType, { label: string; className: string }> = {
  [IntentType.CLARIFICATION]: {
    label: 'Clarification',
    className: 'bg-blue-100 text-blue-700',
  },
  [IntentType.QUOTE_REQUEST]: {
    label: 'Quote Request',
    className: 'bg-amber-100 text-amber-700',
  },
  [IntentType.APPOINTMENT]: {
    label: 'Appointment',
    className: 'bg-emerald-100 text-emerald-700',
  },
  [IntentType.UNDEFINED]: {
    label: 'Non classificato',
    className: 'bg-slate-100 text-slate-500',
  },
}

const FALLBACK_CONFIG = { label: 'Non classificato', className: 'bg-slate-100 text-slate-500' }

interface IntentBadgeProps {
  intent: IntentType
  className?: string
}

export const IntentBadge = ({ intent, className }: IntentBadgeProps) => {
  const config = intentConfig[intent] ?? FALLBACK_CONFIG
  return (
    <span
      className={cn(
        'inline-block text-xs font-medium px-2 py-0.5 rounded-full',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

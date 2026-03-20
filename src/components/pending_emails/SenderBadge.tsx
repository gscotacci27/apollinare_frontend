import { SenderCategory } from '@/types/email'
import { cn } from '@/lib/utils'

const senderConfig: Record<SenderCategory, { label: string; className: string }> = {
  [SenderCategory.CLIENT]: {
    label: 'Da clienti',
    className: 'bg-indigo-100 text-indigo-700',
  },
  [SenderCategory.SUPPLIER]: {
    label: 'Da fornitori',
    className: 'bg-orange-100 text-orange-700',
  },
  [SenderCategory.OTHER]: {
    label: 'Altro',
    className: 'bg-slate-100 text-slate-500',
  },
}

const FALLBACK_CONFIG = { label: 'Altro', className: 'bg-slate-100 text-slate-500' }

interface SenderBadgeProps {
  category: SenderCategory
  className?: string
}

export const SenderBadge = ({ category, className }: SenderBadgeProps) => {
  const config = senderConfig[category] ?? FALLBACK_CONFIG
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

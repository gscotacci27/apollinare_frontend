import { STATO_CONFIG } from '@/types/gestionale'

interface Props {
  stato: string
}

export const StatusBadge = ({ stato }: Props) => {
  const cfg = STATO_CONFIG[stato] ?? { label: stato, bg: 'bg-slate-100', text: 'text-slate-500' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

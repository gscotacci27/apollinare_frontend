import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { IntentBadge } from './IntentBadge'
import { SenderBadge } from './SenderBadge'
import { cn } from '@/lib/utils'
import type { Email } from '@/types/email'

const AVATAR_COLORS = [
  'bg-violet-200 text-violet-700',
  'bg-blue-200 text-blue-700',
  'bg-emerald-200 text-emerald-700',
  'bg-amber-200 text-amber-700',
  'bg-rose-200 text-rose-700',
  'bg-cyan-200 text-cyan-700',
]

const getAvatarColor = (name: string) => {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

interface EmailCardProps {
  email: Email
  index: number
  selected: boolean
  onClick: () => void
}

export const EmailCard = ({ email, index, selected, onClick }: EmailCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50',
        selected && 'bg-indigo-50/60 border-l-2 border-l-indigo-500 pl-[14px]',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
            getAvatarColor(email.sender_name),
          )}
        >
          {getInitials(email.sender_name)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + time */}
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {email.sender_name}
            </span>
            <span className="text-xs text-slate-400 shrink-0">
              {formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}
            </span>
          </div>

          {/* Email address */}
          <p className="text-xs text-slate-400 truncate mb-2">{email.sender_email}</p>

          {/* Badges */}
          <div className="flex items-center gap-1.5">
            <SenderBadge category={email.sender_category} />
            <IntentBadge intent={email.detected_intent} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

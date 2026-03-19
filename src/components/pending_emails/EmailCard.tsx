import { Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { IntentBadge } from './IntentBadge'
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
  onApprove: (e: React.MouseEvent) => void
  onReject: (e: React.MouseEvent) => void
}

export const EmailCard = ({ email, index, selected, onClick, onApprove, onReject }: EmailCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'group relative p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50',
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

          {/* Intent badge */}
          <IntentBadge intent={email.detected_intent} className="mb-2" />

          {/* Draft preview */}
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {email.draft_reply.length > 80
              ? email.draft_reply.slice(0, 80) + '…'
              : email.draft_reply}
          </p>
        </div>
      </div>

      {/* Hover quick actions */}
      <div className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1">
        <button
          onClick={onApprove}
          title="Quick approve"
          className="p-1.5 rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onReject}
          title="Quick reject"
          className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

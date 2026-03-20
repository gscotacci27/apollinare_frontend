import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { Mail } from 'lucide-react'
import { IntentBadge } from './IntentBadge'
import { SenderBadge } from './SenderBadge'
import { Button } from '@/components/ui/Button'
import type { Email } from '@/types/email'

interface EmailDetailPanelProps {
  email: Email | null
  onApprove: (draft: string) => void
  onReject: () => void
  isPending: boolean
}

export const EmailDetailPanel = ({ email, onApprove, onReject, isPending }: EmailDetailPanelProps) => {
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (email) setDraft(email.draft_reply)
  }, [email?.request_id])

  return (
    <div className="h-full flex flex-col bg-white">
      <AnimatePresence mode="wait">
        {!email ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Select an email to review</p>
              <p className="text-xs text-slate-400 mt-1">
                Choose an email from the list to see the full details and draft reply.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={email.request_id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{email.sender_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{email.sender_email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">
                    {format(new Date(email.timestamp), 'dd MMM yyyy, HH:mm')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <SenderBadge category={email.sender_category} />
                <IntentBadge intent={email.detected_intent} />
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Original email */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Original email
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 font-mono leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
                  {email.raw_email_body}
                </div>
              </div>

              {/* Draft reply */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Draft reply
                  <span className="ml-2 text-slate-300 font-normal normal-case tracking-normal">
                    — editable
                  </span>
                </p>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={9}
                  className="w-full text-sm text-slate-800 bg-white border border-slate-200 rounded-lg p-4 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-2 shrink-0">
              <Button
                color="green"
                className="w-full"
                onClick={() => onApprove(draft)}
                disabled={isPending || !draft.trim()}
              >
                Approve &amp; send
              </Button>
              <Button
                variant="outline"
                color="red"
                className="w-full"
                onClick={onReject}
                disabled={isPending}
              >
                Reject
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

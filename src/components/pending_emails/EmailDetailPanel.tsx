import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { Mail, Loader2, Sparkles, Send } from 'lucide-react'
import { IntentBadge } from './IntentBadge'
import { SenderBadge } from './SenderBadge'
import { Button } from '@/components/ui/Button'
import type { Email } from '@/types/email'

interface EmailDetailPanelProps {
  email: Email | null
  isLoadingDetail: boolean
  draft: string
  onDraftChange: (value: string) => void
  onGenerate: () => void
  onSend: () => void
  isGenerating: boolean
  isSending: boolean
}

export const EmailDetailPanel = ({
  email,
  isLoadingDetail,
  draft,
  onDraftChange,
  onGenerate,
  onSend,
  isGenerating,
  isSending,
}: EmailDetailPanelProps) => {
  const isBusy = isGenerating || isSending

  return (
    <div className="h-full flex flex-col bg-white">
      <AnimatePresence mode="wait">
        {!email && !isLoadingDetail ? (
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
                Choose an email from the list, then generate and send a reply.
              </p>
            </div>
          </motion.div>
        ) : isLoadingDetail ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
          </motion.div>
        ) : email ? (
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
                  {email.raw_email_body || (
                    <span className="text-slate-400 italic">No preview available</span>
                  )}
                </div>
              </div>

              {/* Response box */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Response
                  {draft && (
                    <span className="ml-2 text-slate-300 font-normal normal-case tracking-normal">
                      — editable
                    </span>
                  )}
                </p>
                <div className="relative">
                  <textarea
                    value={draft}
                    onChange={(e) => onDraftChange(e.target.value)}
                    disabled={isBusy}
                    rows={10}
                    placeholder={
                      isGenerating
                        ? 'Generating response…'
                        : 'Press "Generate Response" to create a draft reply.'
                    }
                    className="w-full text-sm text-slate-800 bg-white border border-slate-200 rounded-lg p-4 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-300"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={onGenerate}
                disabled={isBusy}
              >
                <Sparkles className="w-4 h-4" />
                Generate Response
              </Button>
              <Button
                color="green"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={onSend}
                disabled={isBusy || !draft.trim()}
              >
                <Send className="w-4 h-4" />
                Send Email
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { EmailCard } from './EmailCard'
import { EmailDetailPanel } from './EmailDetailPanel'
import { EmailSkeleton } from './EmailSkeleton'
import { RejectModal } from './RejectModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useEmails } from '@/hooks/useEmails'
import { useApproveEmail } from '@/hooks/useApproveEmail'
import { useRejectEmail } from '@/hooks/useRejectEmail'
import type { Email } from '@/types/email'

export const PendingEmailsPage = () => {
  const { data: emails = [], isLoading } = useEmails()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  const approveMutation = useApproveEmail()
  const rejectMutation = useRejectEmail()

  const selectedEmail = emails.find((e) => e.request_id === selectedId) ?? null

  const selectNext = (currentId: string) => {
    const idx = emails.findIndex((e) => e.request_id === currentId)
    const next = emails[idx + 1] ?? emails[idx - 1] ?? null
    setSelectedId(next?.request_id ?? null)
  }

  const handleApprove = (email: Email, draft: string) => {
    approveMutation.mutate(
      { request_id: email.request_id, draft_reply: draft },
      { onSuccess: () => selectNext(email.request_id) },
    )
  }

  const handleRejectConfirm = (reason: string) => {
    if (!selectedEmail) return
    const id = selectedEmail.request_id
    rejectMutation.mutate(
      { request_id: id, reason },
      {
        onSuccess: () => {
          setRejectModalOpen(false)
          selectNext(id)
        },
      },
    )
  }

  const isPending = approveMutation.isPending || rejectMutation.isPending

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Pending Emails" count={emails.length} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left column — email list (40%) */}
        <div className="w-2/5 flex flex-col border-r border-slate-200 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <>
                <EmailSkeleton />
                <EmailSkeleton />
                <EmailSkeleton />
              </>
            ) : emails.length === 0 ? (
              <EmptyState
                title="All caught up — no pending emails"
                description="New emails will appear here automatically every 30 seconds."
              />
            ) : (
              <AnimatePresence initial={false}>
                {emails.map((email, index) => (
                  <EmailCard
                    key={email.request_id}
                    email={email}
                    index={index}
                    selected={email.request_id === selectedId}
                    onClick={() => setSelectedId(email.request_id)}
                    onApprove={(e) => {
                      e.stopPropagation()
                      handleApprove(email, email.draft_reply)
                    }}
                    onReject={(e) => {
                      e.stopPropagation()
                      setSelectedId(email.request_id)
                      setRejectModalOpen(true)
                    }}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right column — detail panel (60%) */}
        <div className="flex-1 overflow-hidden">
          <EmailDetailPanel
            email={selectedEmail}
            onApprove={(draft) => selectedEmail && handleApprove(selectedEmail, draft)}
            onReject={() => setRejectModalOpen(true)}
            isPending={isPending}
          />
        </div>
      </div>

      <RejectModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        isPending={rejectMutation.isPending}
      />
    </div>
  )
}

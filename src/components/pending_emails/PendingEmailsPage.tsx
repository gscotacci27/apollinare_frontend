import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { EmailCard } from './EmailCard'
import { EmailDetailPanel } from './EmailDetailPanel'
import { EmailSkeleton } from './EmailSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useEmails } from '@/hooks/useEmails'
import { useEmailDetail } from '@/hooks/useEmailDetail'
import { useGenerateResponse } from '@/hooks/useGenerateResponse'
import { useSendEmail } from '@/hooks/useSendEmail'

export const PendingEmailsPage = () => {
  const { data: emails = [], isLoading } = useEmails()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Draft lives here so it resets on email switch and is shared between
  // the Generate button and the Send button.
  const [draft, setDraft] = useState('')

  const { data: selectedEmail, isLoading: isLoadingDetail } = useEmailDetail(selectedId)

  // CRITICAL: reset draft every time a different email is selected to prevent
  // a previously generated response from leaking into the new selection.
  useEffect(() => {
    setDraft('')
  }, [selectedId])

  const selectNext = (currentId: string) => {
    const idx = emails.findIndex((e) => e.request_id === currentId)
    const next = emails[idx + 1] ?? emails[idx - 1] ?? null
    setSelectedId(next?.request_id ?? null)
  }

  const generateMutation = useGenerateResponse((generatedDraft) => {
    setDraft(generatedDraft)
  })

  const sendMutation = useSendEmail((sentId) => {
    selectNext(sentId)
  })

  const handleGenerate = () => {
    if (!selectedId) return
    generateMutation.mutate(selectedId)
  }

  const handleSend = () => {
    if (!selectedId || !draft.trim()) return
    sendMutation.mutate({ request_id: selectedId, body: draft })
  }

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
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right column — detail panel (60%) */}
        <div className="flex-1 overflow-hidden">
          <EmailDetailPanel
            email={selectedEmail ?? null}
            isLoadingDetail={isLoadingDetail && !!selectedId}
            draft={draft}
            onDraftChange={setDraft}
            onGenerate={handleGenerate}
            onSend={handleSend}
            isGenerating={generateMutation.isPending}
            isSending={sendMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}

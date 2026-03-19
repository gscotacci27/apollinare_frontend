import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface RejectModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  isPending: boolean
}

export const RejectModal = ({ open, onClose, onConfirm, isPending }: RejectModalProps) => {
  const [reason, setReason] = useState('')
  const isValid = reason.trim().length >= 10

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm(reason.trim())
    setReason('')
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Reject email">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Reason for rejection
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Explain why this email is being rejected (min 10 characters)…"
            className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
          />
          {reason.length > 0 && !isValid && (
            <p className="text-xs text-red-500 mt-1">
              Minimum 10 characters ({reason.trim().length}/10)
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            color="red"
            className="flex-1"
            onClick={handleConfirm}
            disabled={!isValid || isPending}
          >
            Confirm reject
          </Button>
          <Button
            variant="outline"
            color="slate"
            className="flex-1"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

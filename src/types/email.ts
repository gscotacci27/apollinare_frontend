export enum IntentType {
  CLARIFICATION = 'CLARIFICATION',
  QUOTE_REQUEST = 'QUOTE_REQUEST',
  APPOINTMENT = 'APPOINTMENT',
}

export enum EmailStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Email {
  request_id: string
  timestamp: string
  sender_email: string
  sender_name: string
  detected_intent: IntentType
  draft_reply: string
  status: EmailStatus
  rejection_reason: string | null
  raw_email_body: string
}

export interface ApiError {
  message: string
  status: number
}

import axios from 'axios'
import type { Email, ApiError } from '@/types/email'

const api = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message ?? error.message ?? 'Unknown error',
      status: error.response?.status ?? 0,
    }
    return Promise.reject(apiError)
  },
)

export const getPendingEmails = async (): Promise<Email[]> => {
  const { data } = await api.get<Email[]>('/emails/pending')
  return data
}

export const approveEmail = async (request_id: string, draft_reply: string): Promise<void> => {
  await api.post(`/emails/${request_id}/approve`, { draft_reply })
}

export const rejectEmail = async (request_id: string, reason: string): Promise<void> => {
  await api.post(`/emails/${request_id}/reject`, { reason })
}

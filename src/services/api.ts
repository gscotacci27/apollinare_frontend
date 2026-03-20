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
  if (!Array.isArray(data)) return []
  return data
}

export const getEmailById = async (request_id: string): Promise<Email> => {
  const { data } = await api.get<Email>(`/emails/${request_id}`)
  return data
}

export const generateResponse = async (request_id: string): Promise<string> => {
  const { data } = await api.post<{ draft: string }>(`/emails/${request_id}/generate`)
  return data.draft
}

export const sendEmail = async (request_id: string, body: string): Promise<void> => {
  await api.post(`/emails/${request_id}/send`, { body })
}

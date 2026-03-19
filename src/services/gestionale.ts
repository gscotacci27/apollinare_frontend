import axios from 'axios'
import type { Evento } from '@/types/gestionale'

const gestionale = axios.create({
  baseURL: import.meta.env.VITE_GESTIONALE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const getEventi = async (params?: {
  stato?: number
  data_da?: string
  data_a?: string
}): Promise<Evento[]> => {
  const { data } = await gestionale.get<Evento[]>('/eventi', { params })
  return data
}

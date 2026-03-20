import axios from 'axios'
import type { EventoResponse, EventoCreate, LocationItem, TipoEventoItem } from '@/types/gestionale'

const gestionale = axios.create({
  baseURL: import.meta.env.VITE_GESTIONALE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── SF-001 Eventi ─────────────────────────────────────────────────────────────

export interface GetEventiParams {
  stato?: number
  data_da?: string
  data_a?: string
  id_location?: number
}

export const getEventi = async (params?: GetEventiParams): Promise<EventoResponse[]> => {
  const { data } = await gestionale.get<EventoResponse[]>('/eventi', { params })
  return data
}

export const getEvento = async (id: number): Promise<EventoResponse> => {
  const { data } = await gestionale.get<EventoResponse>(`/eventi/${id}`)
  return data
}

export const createEvento = async (body: EventoCreate): Promise<{ id: number }> => {
  const { data } = await gestionale.post<{ id: number }>('/eventi', body)
  return data
}

// ── Lookup ────────────────────────────────────────────────────────────────────

export const getLocation = async (): Promise<LocationItem[]> => {
  const { data } = await gestionale.get<LocationItem[]>('/lookup/location')
  return data
}

export const createLocation = async (location: string): Promise<LocationItem> => {
  const { data } = await gestionale.post<LocationItem>('/lookup/location', { location })
  return data
}

export const getTipiEvento = async (): Promise<TipoEventoItem[]> => {
  const { data } = await gestionale.get<TipoEventoItem[]>('/lookup/tipi-evento')
  return data
}

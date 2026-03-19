import axios from 'axios'
import type { Evento, EventoCreate, TipoEvento, Location } from '@/types/gestionale'

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

export const createEvento = async (body: EventoCreate): Promise<{ id: number }> => {
  const { data } = await gestionale.post<{ id: number }>('/eventi', body)
  return data
}

export const getTipiEvento = async (): Promise<TipoEvento[]> => {
  const { data } = await gestionale.get<TipoEvento[]>('/tipi-evento')
  return data
}

export const getLocation = async (): Promise<Location[]> => {
  const { data } = await gestionale.get<Location[]>('/location')
  return data
}

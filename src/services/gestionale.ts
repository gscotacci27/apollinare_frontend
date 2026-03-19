import axios from 'axios'
import type { Evento, EventoCreate, EventoUpdate, TipoEvento, Location, OspitiItem, Preventivo } from '@/types/gestionale'

const gestionale = axios.create({
  baseURL: import.meta.env.VITE_GESTIONALE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const getEventi = async (params?: { stato?: number; data_da?: string; data_a?: string }): Promise<Evento[]> => {
  const { data } = await gestionale.get<Evento[]>('/eventi', { params })
  return data
}

export const getEvento = async (id: number): Promise<Evento> => {
  const { data } = await gestionale.get<Evento>(`/eventi/${id}`)
  return data
}

export const createEvento = async (body: EventoCreate): Promise<{ id: number }> => {
  const { data } = await gestionale.post<{ id: number }>('/eventi', body)
  return data
}

export const updateEvento = async (id: number, body: EventoUpdate): Promise<void> => {
  await gestionale.put(`/eventi/${id}`, body)
}

export const getOspiti = async (id: number): Promise<OspitiItem[]> => {
  const { data } = await gestionale.get<OspitiItem[]>(`/eventi/${id}/ospiti`)
  return data
}

export const upsertOspiti = async (id: number, items: OspitiItem[]): Promise<void> => {
  await gestionale.put(`/eventi/${id}/ospiti`, items)
}

export const getPreventivo = async (id: number): Promise<Preventivo> => {
  const { data } = await gestionale.get<Preventivo>(`/eventi/${id}/preventivo`)
  return data
}

export const getTipiEvento = async (): Promise<TipoEvento[]> => {
  const { data } = await gestionale.get<TipoEvento[]>('/tipi-evento')
  return data
}

export const getTipiOspiti = async (): Promise<{ cod_tipo: string; descrizione: string }[]> => {
  const { data } = await gestionale.get('/tipi-ospiti')
  return data
}

export const getLocation = async (): Promise<Location[]> => {
  const { data } = await gestionale.get<Location[]>('/location')
  return data
}

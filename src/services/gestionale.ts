import axios from 'axios'
import type {
  EventoResponse, EventoCreate, LocationItem, TipoEventoItem,
  ListaCaricaItem, ArticoloLookupItem, SezioneItem, AddArticoloBody, UpdateListaItemBody,
  PatchEventoBody, SchedaResponse, ExtraItem, AccontoItem, DegustazioneItem,
} from '@/types/gestionale'

const gestionale = axios.create({
  baseURL: import.meta.env.VITE_GESTIONALE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Diagnostica temporanea — logga ogni chiamata reale al backend
gestionale.interceptors.request.use((config) => {
  // eslint-disable-next-line no-console
  console.log('[axios] →', config.method?.toUpperCase(), config.url, config.params ?? {})
  return config
})
gestionale.interceptors.response.use((res) => {
  const data = res.data
  const stati = Array.isArray(data) ? [...new Set(data.map((e: { stato: string }) => e.stato))] : '—'
  // eslint-disable-next-line no-console
  console.log('[axios] ←', res.config.url, res.config.params, '| n:', Array.isArray(data) ? data.length : '?', '| stati:', stati)
  return res
})

// ── SF-001 Eventi ─────────────────────────────────────────────────────────────

export interface GetEventiParams {
  stato?: string
  data_da?: string
  data_a?: string
  id_location?: number
}

export const getEventi = async (params?: GetEventiParams, signal?: AbortSignal): Promise<EventoResponse[]> => {
  const { data } = await gestionale.get<EventoResponse[]>('/eventi', { params, signal })
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

export const patchEvento = async (id: number, body: PatchEventoBody): Promise<void> => {
  await gestionale.patch(`/eventi/${id}`, body)
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

export const getSezioni = async (): Promise<SezioneItem[]> => {
  const { data } = await gestionale.get<SezioneItem[]>('/lookup/sezioni')
  return data
}

export const getArticoliDisponibili = async (): Promise<ArticoloLookupItem[]> => {
  const { data } = await gestionale.get<ArticoloLookupItem[]>('/lookup/articoli')
  return data
}

// ── SF-002 Lista di Carico ─────────────────────────────────────────────────────

export const getListaCarico = async (idEvento: number): Promise<ListaCaricaItem[]> => {
  const { data } = await gestionale.get<ListaCaricaItem[]>(`/eventi/${idEvento}/lista`)
  return data
}

export const addArticolo = async (
  idEvento: number, body: AddArticoloBody
): Promise<ListaCaricaItem> => {
  const { data } = await gestionale.post<ListaCaricaItem>(`/eventi/${idEvento}/lista`, body)
  return data
}

export const updateArticolo = async (
  idEvento: number, itemId: number, body: UpdateListaItemBody
): Promise<void> => {
  await gestionale.put(`/eventi/${idEvento}/lista/${itemId}`, body)
}

export const deleteArticolo = async (idEvento: number, itemId: number): Promise<void> => {
  await gestionale.delete(`/eventi/${idEvento}/lista/${itemId}`)
}

export const recalcolaLista = async (idEvento: number): Promise<{ recalculated: number }> => {
  const { data } = await gestionale.post<{ recalculated: number }>(`/eventi/${idEvento}/lista/recalcola`)
  return data
}

export const salvaLista = async (idEvento: number): Promise<{ saved: number }> => {
  const { data } = await gestionale.post<{ saved: number }>(`/eventi/${idEvento}/lista/salva`)
  return data
}

export const ricaricaLista = async (idEvento: number): Promise<ListaCaricaItem[]> => {
  const { data } = await gestionale.post<ListaCaricaItem[]>(`/eventi/${idEvento}/lista/ricarica`)
  return data
}

// ── SF-003 Scheda Evento ───────────────────────────────────────────────────────

export const getScheda = async (idEvento: number): Promise<SchedaResponse> => {
  const { data } = await gestionale.get<SchedaResponse>(`/eventi/${idEvento}/scheda`)
  return data
}

export const updateOspite = async (
  idEvento: number,
  codTipo: string,
  body: { numero: number; costo: number; sconto: number; note: string | null },
): Promise<void> => {
  await gestionale.put(`/eventi/${idEvento}/scheda/ospiti/${encodeURIComponent(codTipo)}`, body)
}

export const addExtra = async (
  idEvento: number,
  body: { descrizione: string; costo: number; quantity: number },
): Promise<ExtraItem> => {
  const { data } = await gestionale.post<ExtraItem>(`/eventi/${idEvento}/scheda/extra`, body)
  return data
}

export const deleteExtra = async (idEvento: number, id: number): Promise<void> => {
  await gestionale.delete(`/eventi/${idEvento}/scheda/extra/${id}`)
}

export const addAcconto = async (
  idEvento: number,
  body: { acconto: number; data: string | null; a_conferma: number; descrizione: string | null },
): Promise<AccontoItem> => {
  const { data } = await gestionale.post<AccontoItem>(`/eventi/${idEvento}/scheda/acconti`, body)
  return data
}

export const deleteAcconto = async (idEvento: number, id: number): Promise<void> => {
  await gestionale.delete(`/eventi/${idEvento}/scheda/acconti/${id}`)
}

export const addDegustazione = async (
  idEvento: number,
  body: { data?: string | null; nome?: string | null; n_persone?: number; costo_degustazione?: number; detraibile?: number; note?: string | null },
): Promise<DegustazioneItem> => {
  const { data } = await gestionale.post<DegustazioneItem>(`/eventi/${idEvento}/scheda/degustazioni`, body)
  return data
}

export const deleteDegustazione = async (idEvento: number, id: number): Promise<void> => {
  await gestionale.delete(`/eventi/${idEvento}/scheda/degustazioni/${id}`)
}

export const updateSconto = async (idEvento: number, sconto_totale: number): Promise<void> => {
  await gestionale.patch(`/eventi/${idEvento}/scheda/sconto`, { sconto_totale })
}

export const updateTotaleManuale = async (idEvento: number, totale_manuale: number | null): Promise<void> => {
  await gestionale.patch(`/eventi/${idEvento}/scheda/totale-manuale`, { totale_manuale })
}

export const salvaScheda = async (idEvento: number): Promise<{ saved: boolean }> => {
  const { data } = await gestionale.post<{ saved: boolean }>(`/eventi/${idEvento}/scheda/salva`)
  return data
}

export const ricaricaScheda = async (idEvento: number): Promise<SchedaResponse> => {
  const { data } = await gestionale.post<SchedaResponse>(`/eventi/${idEvento}/scheda/ricarica`)
  return data
}

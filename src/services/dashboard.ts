import axios from 'axios'

const gestionale = axios.create({
  baseURL: import.meta.env.VITE_GESTIONALE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export interface DashboardKpi {
  eventi_attivi: number
  liste_aperte: number
  articoli_totali: number
}

export interface ProssimoEvento {
  id: number
  descrizione: string | null
  data: string | null
  ora_evento: string | null
  stato: number
  cliente: string | null
  location_nome: string | null
  tot_ospiti: number | null
}

export interface ListaApertaItem {
  id: number
  descrizione: string | null
  data: string | null
  stato: number
  cliente: string | null
  location_nome: string | null
  tot_ospiti: number | null
}

export interface CaricoLavoroItem {
  settimana: string
  preventivo: number
  in_lavorazione: number
  confermato: number
}

export interface ArticoloSottoScorta {
  cod_articolo: string
  descrizione: string | null
  qta_giac: number
  qta_impegnata: number
  perc_impegnata: number
}

export type AttivitaTipo = 'evento' | 'acconto'
export interface AttivitaItem {
  id: number
  tipo: AttivitaTipo
  descrizione: string | null
  cliente: string | null
  data: string | null
  stato?: number
  id_evento?: number
  importo?: number
}

export const getDashboardKpi = async (): Promise<DashboardKpi> => {
  const { data } = await gestionale.get<DashboardKpi>('/dashboard/kpi')
  return data
}

export const getProssimiEventi = async (): Promise<ProssimoEvento[]> => {
  const { data } = await gestionale.get<ProssimoEvento[]>('/dashboard/prossimi-eventi')
  return data
}

export const getListeAperte = async (): Promise<ListaApertaItem[]> => {
  const { data } = await gestionale.get<ListaApertaItem[]>('/dashboard/liste-aperte')
  return data
}

export const getCaricoLavoro = async (): Promise<CaricoLavoroItem[]> => {
  const { data } = await gestionale.get<CaricoLavoroItem[]>('/dashboard/carico-lavoro')
  return data
}

export const getArticoliSottoScorta = async (): Promise<ArticoloSottoScorta[]> => {
  const { data } = await gestionale.get<ArticoloSottoScorta[]>('/dashboard/articoli-sotto-scorta')
  return data
}

export const getAttivitaRecenti = async (): Promise<AttivitaItem[]> => {
  const { data } = await gestionale.get<AttivitaItem[]>('/dashboard/attivita-recenti')
  return data
}

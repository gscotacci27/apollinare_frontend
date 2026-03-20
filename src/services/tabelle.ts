import axios from 'axios'

const gestionale = axios.create({
  baseURL: import.meta.env.VITE_GESTIONALE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Location ──────────────────────────────────────────────────────────────────

export interface LocationConUso {
  id: number
  location: string
  n_eventi: number
}

export interface LocationSimile {
  id: number
  location: string
  similarita: number
}

export const getTabelleLocation = async (): Promise<LocationConUso[]> => {
  const { data } = await gestionale.get<LocationConUso[]>('/tabelle/location')
  return data
}

export const getLocationSimili = async (id: number): Promise<LocationSimile[]> => {
  const { data } = await gestionale.get<LocationSimile[]>(`/tabelle/location/${id}/simili`)
  return data
}

export const renameLocation = async (id: number, location: string): Promise<void> => {
  await gestionale.patch(`/tabelle/location/${id}`, { location })
}

export const deleteLocation = async (id: number): Promise<void> => {
  await gestionale.delete(`/tabelle/location/${id}`)
}

export const mergeLocation = async (sourceId: number, targetId: number): Promise<{ eventi_spostati: number }> => {
  const { data } = await gestionale.post(`/tabelle/location/${sourceId}/merge`, { target_id: targetId })
  return data
}

// ── Articoli ──────────────────────────────────────────────────────────────────

export interface ArticoloTabella {
  cod_articolo: string
  descrizione: string | null
  cod_categ: string | null
  cod_tipo: string | null
  tipo_desc: string | null
  qta_giac: number | null
  rank: number | null
  coeff_a: number | null
  coeff_s: number | null
  coeff_b: number | null
  qta_std_a: number | null
  qta_std_s: number | null
  qta_std_b: number | null
  perc_ospiti: number | null
  perc_iva: number | null
  flg_qta_type: string | null
}

export interface ArticoloPatch {
  descrizione?: string
  qta_giac?: number
  rank?: number
  cod_categ?: string
  coeff_a?: number
  coeff_s?: number
  coeff_b?: number
  qta_std_a?: number
  qta_std_s?: number
  qta_std_b?: number
  perc_ospiti?: number
  perc_iva?: number
}

export interface ArticoloCreate {
  cod_articolo: string
  descrizione: string
  cod_categ?: string | null
  qta_giac?: number
  rank?: number | null
  coeff_a?: number | null
  coeff_s?: number | null
  coeff_b?: number | null
  qta_std_a?: number | null
  qta_std_s?: number | null
  qta_std_b?: number | null
  perc_ospiti?: number
  perc_iva?: number
}

export const getTabelleArticoli = async (search?: string): Promise<ArticoloTabella[]> => {
  const { data } = await gestionale.get<ArticoloTabella[]>('/tabelle/articoli', {
    params: search ? { search } : undefined,
  })
  return data
}

export const patchArticolo = async (cod: string, body: ArticoloPatch): Promise<void> => {
  await gestionale.patch(`/tabelle/articoli/${encodeURIComponent(cod)}`, body)
}

export const createArticolo = async (body: ArticoloCreate): Promise<void> => {
  await gestionale.post('/tabelle/articoli', body)
}

// ── Sezioni ───────────────────────────────────────────────────────────────────

export interface SezioneTabella {
  cod_tipo: string
  descrizione: string | null
  cod_step: number
  n_articoli: number
}

export const getTabelleSezioni = async (): Promise<SezioneTabella[]> => {
  const { data } = await gestionale.get<SezioneTabella[]>('/tabelle/sezioni')
  return data
}

export const patchSezione = async (cod: string, body: { descrizione?: string; cod_step?: number }): Promise<void> => {
  await gestionale.patch(`/tabelle/sezioni/${encodeURIComponent(cod)}`, body)
}

// ── Tipi Ospiti ───────────────────────────────────────────────────────────────

export interface TipoOspiteTabella {
  cod_tipo: string
  descrizione: string | null
}

export const getTabelleOspiti = async (): Promise<TipoOspiteTabella[]> => {
  const { data } = await gestionale.get<TipoOspiteTabella[]>('/tabelle/tipi-ospiti')
  return data
}

export const patchTipoOspite = async (cod: string, descrizione: string): Promise<void> => {
  await gestionale.patch(`/tabelle/tipi-ospiti/${encodeURIComponent(cod)}`, { descrizione })
}

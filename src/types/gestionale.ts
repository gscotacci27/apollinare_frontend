// ── Evento ────────────────────────────────────────────────────────────────────

export interface EventoResponse {
  id: number
  descrizione: string | null
  data: string | null        // ISO date string "YYYY-MM-DD"
  ora_evento: string | null
  stato: number
  cliente: string | null
  id_location: number | null
  location_nome: string | null
  tot_ospiti: number | null
  perc_sedute_aper: number | null
}

export interface PatchEventoBody {
  stato?: number | null
  descrizione?: string | null
  cliente?: string | null
  data?: string | null
  ora_evento?: string | null
  id_location?: number | null
  tot_ospiti?: number | null
  perc_sedute_aper?: number | null
}

export interface EventoCreate {
  descrizione: string
  data: string               // ISO date "YYYY-MM-DD"
  ora_evento?: string | null
  id_location?: number | null
  stato: number
  cliente?: string | null
}

// ── Stato ─────────────────────────────────────────────────────────────────────

// I tre stati gestibili nel nuovo sistema
export const STATI_GESTIBILI = [
  { value: 100, label: 'Preventivo' },
  { value: 200, label: 'In lavorazione' },
  { value: 400, label: 'Confermato' },
] as const

// Mapping completo per la visualizzazione (include stati legacy del DB Oracle)
export const STATO_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  100: { label: 'Preventivo',      bg: 'bg-slate-100',  text: 'text-slate-600' },
  200: { label: 'In lavorazione',  bg: 'bg-amber-50',   text: 'text-amber-700' },
  300: { label: 'In lavorazione',  bg: 'bg-amber-50',   text: 'text-amber-700' },
  350: { label: 'In lavorazione',  bg: 'bg-amber-50',   text: 'text-amber-700' },
  400: { label: 'Confermato',      bg: 'bg-green-50',   text: 'text-green-700' },
  900: { label: 'Annullato',       bg: 'bg-red-50',     text: 'text-red-600'   },
}

// Tab filtro nella EventiPage
export const FILTRI_STATO = [
  { value: undefined, label: 'Tutti' },
  { value: 100,       label: 'Preventivo' },
  { value: 200,       label: 'In lavorazione' },
  { value: 400,       label: 'Confermato' },
] as const

// ── Lookup ────────────────────────────────────────────────────────────────────

export interface LocationItem {
  id: number
  location: string
}

export interface TipoEventoItem {
  cod_tipo: string
  descrizione: string
  tipo_pasto: string | null
}

// ── SF-002 Lista di Carico ────────────────────────────────────────────────────

export interface ListaCaricaItem {
  id: number
  cod_articolo: string
  descrizione: string | null
  qta: number
  qta_ape: number
  qta_sedu: number
  qta_bufdol: number
  qta_man_ape: number
  qta_man_sedu: number
  qta_man_bufdol: number
  note: string | null
  colore: string | null
  dimensioni: string | null
  ordine: number
  cod_tipo: string | null
  tipo_descrizione: string | null
  cod_step: number
}

export interface SezioneItem {
  cod_tipo: string
  descrizione: string
  cod_step: number
}

export interface ArticoloLookupItem {
  cod_articolo: string
  descrizione: string | null
  qta_giac: number | null
  cod_tipo: string | null
  rank: number | null
}

export interface AddArticoloBody {
  cod_articolo: string
  qta_man_ape?: number
  qta_man_sedu?: number
  qta_man_bufdol?: number
  note?: string | null
}

export interface UpdateListaItemBody {
  qta_ape?: number | null
  qta_sedu?: number | null
  qta_bufdol?: number | null
  qta_man_ape: number
  qta_man_sedu: number
  qta_man_bufdol: number
  note: string | null
  colore: string | null
  dimensioni: string | null
}

// ── SF-003 Scheda Evento ──────────────────────────────────────────────────────

export interface OspiteItem {
  cod_tipo: string
  descrizione: string | null
  numero: number
  costo: number
  sconto: number
  note: string | null
  ordine: number
}

export interface ExtraItem {
  id: number
  descrizione: string
  costo: number
  quantity: number
  ordine: number
}

export interface AccontoItem {
  id: number
  acconto: number
  data: string | null
  a_conferma: number
  descrizione: string | null
  ordine: number
}

export interface PreventivoCalc {
  ospiti_subtotale: number
  articoli_subtotale: number
  extra_subtotale: number
  totale_netto: number
  acconti_totale: number
  saldo: number
}

export interface SchedaResponse {
  ospiti: OspiteItem[]
  extra: ExtraItem[]
  acconti: AccontoItem[]
  preventivo: PreventivoCalc
}

// ── Tipi legacy (usati da altri moduli, non SF-001) ───────────────────────────

export interface OspitiItem {
  cod_tipo_ospite: string
  numero: number
  costo: number
  sconto: number
  note: string | null
  ordine: number | null
}

export interface PreventivoTipo {
  cod_tipo: string
  descrizione: string
  numero: number
  costo: number
  costo_ivato: number
}

export interface Preventivo {
  id_evento: number
  ospiti: { numero: number; costo: number }
  articoli_per_tipo: PreventivoTipo[]
  risorse: number
  degustazioni_detraibili: number
  extra: number
  totale_netto: number
  totale_ivato: number
}

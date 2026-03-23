// ── Evento ────────────────────────────────────────────────────────────────────

export type StatoEvento =
  | 'bozza'
  | 'in_attesa_conferma'
  | 'in_lavorazione'
  | 'confermato'
  | 'annullato'

export interface EventoResponse {
  id: number
  descrizione: string | null
  data: string | null        // ISO date string "YYYY-MM-DD"
  ora_evento: string | null
  stato: StatoEvento
  cliente: string | null
  id_location: number | null
  location_nome: string | null
  tot_ospiti: number | null
  perc_sedute_aper: number | null
}

export interface PatchEventoBody {
  stato?: StatoEvento | null
  descrizione?: string | null
  cliente?: string | null
  data?: string | null
  ora_evento?: string | null
  id_location?: number | null
  perc_sedute_aper?: number | null
}

export interface EventoCreate {
  descrizione: string
  data: string               // ISO date "YYYY-MM-DD"
  ora_evento?: string | null
  id_location?: number | null
  stato: StatoEvento
  cliente?: string | null
}

// ── Stato ─────────────────────────────────────────────────────────────────────

export const STATI_GESTIBILI = [
  { value: 'in_attesa_conferma' as StatoEvento, label: 'Preventivo' },
  { value: 'in_lavorazione'     as StatoEvento, label: 'In lavorazione' },
  { value: 'confermato'         as StatoEvento, label: 'Confermato' },
] as const

export const STATO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  bozza:               { label: 'Bozza',         bg: 'bg-slate-100',  text: 'text-slate-500' },
  in_attesa_conferma:  { label: 'Preventivo',     bg: 'bg-slate-100',  text: 'text-slate-600' },
  in_lavorazione:      { label: 'In lavorazione', bg: 'bg-amber-50',   text: 'text-amber-700' },
  confermato:          { label: 'Confermato',      bg: 'bg-green-50',   text: 'text-green-700' },
  annullato:           { label: 'Annullato',       bg: 'bg-red-50',     text: 'text-red-600'   },
}

export const FILTRI_STATO = [
  { value: undefined,              label: 'Tutti' },
  { value: 'in_attesa_conferma' as StatoEvento, label: 'Preventivo' },
  { value: 'in_lavorazione'     as StatoEvento, label: 'In lavorazione' },
  { value: 'confermato'         as StatoEvento, label: 'Confermato' },
] as const

// Valore speciale per il filtro "storico" (passati)
export const FILTRO_PASSATI = 'passati' as const

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

export interface DegustazioneItem {
  id: number
  data: string | null
  nome: string | null
  n_persone: number
  costo_degustazione: number
  detraibile: number
  consumata: number
  note: string | null
}

export interface PreventivoCalc {
  ospiti_subtotale: number
  articoli_subtotale: number
  extra_subtotale: number
  degustazioni_detraibili: number
  sconto_totale: number
  totale_netto: number
  totale_manuale: number | null
  acconti_totale: number
  saldo: number
}

export interface SchedaResponse {
  ospiti: OspiteItem[]
  extra: ExtraItem[]
  acconti: AccontoItem[]
  degustazioni: DegustazioneItem[]
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

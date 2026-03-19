export interface Evento {
  id: number
  descrizione: string | null
  cod_tipo: string | null
  cliente: string | null
  cliente_tel: string | null
  cliente_email: string | null
  indirizzo: string | null
  data: string | null
  stato: number
  tot_ospiti: number | null
  location: string | null
  tipo_pasto: string | null
  descrizione_tipo: string | null
  color: string | null
  status: string | null
  note: string | null
  // mise en place
  sedia: string | null
  tovaglia: string | null
  tovagliolo: string | null
  runner: string | null
  sottopiatti: string | null
  piattino_pane: string | null
  posate: string | null
  bicchieri: string | null
  stile_colori: string | null
  // menu
  primi: string | null
  secondi: string | null
  vini: string | null
  torta: string | null
  confettata: string | null
  allergie: string | null
}

export type EventoCreate = Partial<Omit<Evento, 'id' | 'tot_ospiti' | 'location' | 'tipo_pasto' | 'descrizione_tipo' | 'color' | 'status'>>
export type EventoUpdate = Partial<Omit<Evento, 'id' | 'tot_ospiti' | 'location' | 'tipo_pasto' | 'descrizione_tipo' | 'color' | 'status'>>

export interface OspitiItem {
  cod_tipo_ospite: string
  numero: number
  costo: number
  sconto: number
  note: string | null
  ordine: number | null
}

export interface TipoEvento {
  cod_tipo: string
  descrizione: string
  tipo_pasto: string | null
}

export interface Location {
  id: number
  location: string
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

// Corrispondenza reale con i codici Oracle
export const STATO_LABELS: Record<number, { label: string; color: string }> = {
  100: { label: 'Preventivo',       color: 'text-slate-600 bg-slate-100' },
  200: { label: 'Scheda Evento',    color: 'text-blue-500 bg-blue-50' },
  300: { label: 'Sch. Confermata',  color: 'text-amber-600 bg-amber-50' },
  350: { label: 'Quasi Confermata', color: 'text-orange-500 bg-orange-50' },
  400: { label: 'Confermato',       color: 'text-green-600 bg-green-50' },
  900: { label: 'Non Accettato',    color: 'text-purple-500 bg-purple-50' },
}

export const STATI_FILTER = [
  { value: undefined, label: 'Tutti' },
  { value: 100,       label: 'Preventivo' },
  { value: 200,       label: 'Scheda Evento' },
  { value: 300,       label: 'Sch. Confermata' },
  { value: 350,       label: 'Quasi Confermata' },
  { value: 400,       label: 'Confermato' },
  { value: 900,       label: 'Non Accettato' },
]

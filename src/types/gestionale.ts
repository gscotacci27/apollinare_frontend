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
}

export interface EventoCreate {
  cliente?: string
  cliente_tel?: string
  cliente_email?: string
  data?: string
  cod_tipo?: string
  id_location?: number
  stato?: number
  descrizione?: string
  indirizzo?: string
  note?: string
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

// Corrispondenza reale con i codici Oracle
export const STATO_LABELS: Record<number, { label: string; color: string }> = {
  100: { label: 'Preventivo',        color: 'text-slate-600 bg-slate-100' },
  200: { label: 'Scheda Evento',     color: 'text-blue-500 bg-blue-50' },
  300: { label: 'Sch. Confermata',   color: 'text-amber-600 bg-amber-50' },
  350: { label: 'Quasi Confermata',  color: 'text-orange-500 bg-orange-50' },
  400: { label: 'Confermato',        color: 'text-green-600 bg-green-50' },
  900: { label: 'Non Accettato',     color: 'text-purple-500 bg-purple-50' },
}

export const STATI_FILTER = [
  { value: undefined,  label: 'Tutti' },
  { value: 100,        label: 'Preventivo' },
  { value: 200,        label: 'Scheda Evento' },
  { value: 300,        label: 'Sch. Confermata' },
  { value: 350,        label: 'Quasi Confermata' },
  { value: 400,        label: 'Confermato' },
  { value: 900,        label: 'Non Accettato' },
]

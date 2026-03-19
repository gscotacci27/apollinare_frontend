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

export const STATO_LABELS: Record<number, { label: string; color: string }> = {
  100: { label: 'Preventivo', color: 'text-amber-400 bg-amber-400/10' },
  200: { label: 'Confermato', color: 'text-blue-400 bg-blue-400/10' },
  300: { label: 'In corso', color: 'text-indigo-400 bg-indigo-400/10' },
  350: { label: 'Concluso', color: 'text-slate-400 bg-slate-400/10' },
  400: { label: 'Annullato', color: 'text-red-400 bg-red-400/10' },
}

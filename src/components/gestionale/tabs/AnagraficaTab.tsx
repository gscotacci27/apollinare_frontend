import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateEvento, getTipiEvento, getLocation } from '@/services/gestionale'
import { STATO_LABELS } from '@/types/gestionale'
import type { Evento, EventoUpdate } from '@/types/gestionale'

interface Props { evento: Evento }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
const selectCls = inputCls + ' bg-white'

export function AnagraficaTab({ evento }: Props) {
  const qc = useQueryClient()
  const [form, setForm] = useState<EventoUpdate>({
    cliente: evento.cliente ?? '',
    cliente_tel: evento.cliente_tel ?? '',
    cliente_email: evento.cliente_email ?? '',
    data: evento.data ?? '',
    indirizzo: evento.indirizzo ?? '',
    cod_tipo: evento.cod_tipo ?? '',
    id_location: undefined,
    stato: evento.stato,
    descrizione: evento.descrizione ?? '',
    note: evento.note ?? '',
    allergie: evento.allergie ?? '',
  })

  const { data: tipi = [] } = useQuery({ queryKey: ['tipi-evento'], queryFn: getTipiEvento })
  const { data: locations = [] } = useQuery({ queryKey: ['location'], queryFn: getLocation })

  const mutation = useMutation({
    mutationFn: (body: EventoUpdate) => updateEvento(evento.id, body),
    onSuccess: () => {
      toast.success('Salvato')
      qc.invalidateQueries({ queryKey: ['eventi'] })
      qc.invalidateQueries({ queryKey: ['evento', evento.id] })
    },
    onError: () => toast.error('Errore nel salvataggio'),
  })

  const set = (k: keyof EventoUpdate, v: string | number | undefined) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-5 space-y-4 overflow-y-auto flex-1">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Cliente">
          <input className={inputCls} value={form.cliente ?? ''} onChange={e => set('cliente', e.target.value)} />
        </Field>
        <Field label="Stato">
          <select className={selectCls} value={form.stato} onChange={e => set('stato', Number(e.target.value))}>
            {Object.entries(STATO_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Data evento">
          <input type="date" className={inputCls} value={form.data ?? ''} onChange={e => set('data', e.target.value || undefined)} />
        </Field>
        <Field label="Tipo evento">
          <select className={selectCls} value={form.cod_tipo ?? ''} onChange={e => set('cod_tipo', e.target.value || undefined)}>
            <option value="">— Seleziona —</option>
            {tipi.map(t => <option key={t.cod_tipo} value={t.cod_tipo}>{t.descrizione}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Location">
        <select className={selectCls} value={form.id_location ?? ''} onChange={e => set('id_location', e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">{evento.location ?? '— Seleziona —'}</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.location}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Telefono">
          <input className={inputCls} value={form.cliente_tel ?? ''} onChange={e => set('cliente_tel', e.target.value)} />
        </Field>
        <Field label="Email cliente">
          <input type="email" className={inputCls} value={form.cliente_email ?? ''} onChange={e => set('cliente_email', e.target.value)} />
        </Field>
      </div>

      <Field label="Indirizzo">
        <input className={inputCls} value={form.indirizzo ?? ''} onChange={e => set('indirizzo', e.target.value)} />
      </Field>

      <Field label="Descrizione">
        <input className={inputCls} value={form.descrizione ?? ''} onChange={e => set('descrizione', e.target.value)} />
      </Field>

      <Field label="Allergie">
        <input className={inputCls} value={form.allergie ?? ''} onChange={e => set('allergie', e.target.value)} />
      </Field>

      <Field label="Note">
        <textarea className={inputCls + ' resize-none'} rows={3} value={form.note ?? ''} onChange={e => set('note', e.target.value)} />
      </Field>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Salva
        </button>
      </div>
    </div>
  )
}

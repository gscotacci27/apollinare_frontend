import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateEvento } from '@/services/gestionale'
import type { Evento } from '@/types/gestionale'

interface Props { evento: Evento }

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const FIELDS: { key: keyof Evento; label: string }[] = [
  { key: 'sedia',        label: 'Sedia' },
  { key: 'tovaglia',     label: 'Tovaglia' },
  { key: 'tovagliolo',   label: 'Tovagliolo' },
  { key: 'runner',       label: 'Runner' },
  { key: 'sottopiatti',  label: 'Sottopiatti' },
  { key: 'piattino_pane',label: 'Piattino pane' },
  { key: 'posate',       label: 'Posate' },
  { key: 'bicchieri',    label: 'Bicchieri' },
  { key: 'stile_colori', label: 'Stile / colori' },
]

export function MiseEnPlaceTab({ evento }: Props) {
  const qc = useQueryClient()
  const [form, setForm] = useState<Partial<Evento>>(
    Object.fromEntries(FIELDS.map(f => [f.key, evento[f.key] ?? '']))
  )

  const mutation = useMutation({
    mutationFn: () => updateEvento(evento.id, form),
    onSuccess: () => {
      toast.success('Salvato')
      qc.invalidateQueries({ queryKey: ['evento', evento.id] })
    },
    onError: () => toast.error('Errore nel salvataggio'),
  })

  return (
    <div className="p-5 space-y-4 overflow-y-auto flex-1">
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map(f => (
          <Field key={f.key} label={f.label}>
            <input
              className={inputCls}
              value={(form[f.key] as string) ?? ''}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => mutation.mutate()}
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

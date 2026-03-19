import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createEvento, getTipiEvento, getLocation } from '@/services/gestionale'
import type { EventoCreate } from '@/types/gestionale'

interface Props {
  onClose: () => void
}

export function NuovoEventoModal({ onClose }: Props) {
  const qc = useQueryClient()
  const [form, setForm] = useState<EventoCreate>({ stato: 100 })

  const { data: tipi = [] } = useQuery({ queryKey: ['tipi-evento'], queryFn: getTipiEvento })
  const { data: locations = [] } = useQuery({ queryKey: ['location'], queryFn: getLocation })

  const mutation = useMutation({
    mutationFn: createEvento,
    onSuccess: ({ id }) => {
      toast.success(`Evento #${id} creato`)
      qc.invalidateQueries({ queryKey: ['eventi'] })
      onClose()
    },
    onError: () => toast.error('Errore durante la creazione'),
  })

  const set = (field: keyof EventoCreate, value: string | number | undefined) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cliente?.trim()) { toast.error('Inserire il nome del cliente'); return }
    mutation.mutate(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Nuovo evento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cliente <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.cliente ?? ''}
              onChange={(e) => set('cliente', e.target.value)}
              placeholder="Nome cliente"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Data + Stato */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data evento</label>
              <input
                type="date"
                value={form.data ?? ''}
                onChange={(e) => set('data', e.target.value || undefined)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Stato</label>
              <select
                value={form.stato}
                onChange={(e) => set('stato', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
              >
                <option value={100}>Preventivo</option>
                <option value={200}>Scheda Evento</option>
                <option value={300}>Sch. Confermata</option>
                <option value={350}>Quasi Confermata</option>
                <option value={400}>Confermato</option>
              </select>
            </div>
          </div>

          {/* Tipo evento */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tipo evento</label>
            <select
              value={form.cod_tipo ?? ''}
              onChange={(e) => set('cod_tipo', e.target.value || undefined)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option value="">— Seleziona tipo —</option>
              {tipi.map((t) => (
                <option key={t.cod_tipo} value={t.cod_tipo}>{t.descrizione}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <select
              value={form.id_location ?? ''}
              onChange={(e) => set('id_location', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option value="">— Seleziona location —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.location}</option>
              ))}
            </select>
          </div>

          {/* Telefono + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Telefono</label>
              <input
                type="tel"
                value={form.cliente_tel ?? ''}
                onChange={(e) => set('cliente_tel', e.target.value || undefined)}
                placeholder="+39 000 000 0000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.cliente_email ?? ''}
                onChange={(e) => set('cliente_email', e.target.value || undefined)}
                placeholder="cliente@email.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note</label>
            <textarea
              value={form.note ?? ''}
              onChange={(e) => set('note', e.target.value || undefined)}
              rows={2}
              placeholder="Note aggiuntive…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Crea evento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

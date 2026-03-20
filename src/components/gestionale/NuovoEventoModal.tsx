import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'
import { useCreateEvento } from '@/hooks/useCreateEvento'
import { useLookupLocation } from '@/hooks/useLookupLocation'
import { STATI_GESTIBILI } from '@/types/gestionale'

interface Props {
  onClose: () => void
  onCreated?: (id: number) => void
}

export const NuovoEventoModal = ({ onClose, onCreated }: Props) => {
  const [form, setForm] = useState({
    descrizione: '',
    data: '',
    ora_evento: '',
    id_location: '' as string | number,
    stato: 100,
    cliente: '',
  })
  const [dateError, setDateError] = useState('')

  const { data: locations = [] } = useLookupLocation()
  const { mutate, isPending } = useCreateEvento((id) => {
    onCreated?.(id)
    onClose()
  })

  const set = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }))

  const todayIso = new Date().toISOString().split('T')[0]
  const tomorrowIso = new Date(Date.now() + 86_400_000).toISOString().split('T')[0]

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setDateError('')

    // Validazione data futura lato frontend (il backend la ripete)
    if (!form.data || form.data <= todayIso) {
      setDateError("La data dell'evento deve essere futura")
      return
    }

    mutate({
      descrizione: form.descrizione.trim(),
      data: form.data,
      ora_evento: form.ora_evento || null,
      id_location: form.id_location !== '' ? Number(form.id_location) : null,
      stato: form.stato,
      cliente: form.cliente.trim() || null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Nuovo evento</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          {/* Titolo */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Titolo <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.descrizione}
              onChange={(e) => set('descrizione', e.target.value)}
              placeholder="es. Matrimonio Rossi"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Data + Ora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                min={tomorrowIso}
                value={form.data}
                onChange={(e) => { set('data', e.target.value); setDateError('') }}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {dateError && <p className="text-xs text-red-400 mt-1">{dateError}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ora</label>
              <input
                type="time"
                value={form.ora_evento}
                onChange={(e) => set('ora_evento', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
            <select
              value={form.id_location}
              onChange={(e) => set('id_location', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">— Nessuna —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.location}</option>
              ))}
            </select>
          </div>

          {/* Stato */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Stato <span className="text-red-500">*</span>
            </label>
            <select
              value={form.stato}
              onChange={(e) => set('stato', Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {STATI_GESTIBILI.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Cliente</label>
            <input
              type="text"
              value={form.cliente}
              onChange={(e) => set('cliente', e.target.value)}
              placeholder="Nome o ragione sociale"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
            >
              {isPending ? 'Salvataggio…' : 'Crea evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'
import { ArticoloCombobox } from './ArticoloCombobox'
import { useAddArticolo } from '@/hooks/useAddArticolo'

interface Props {
  idEvento: number
  onClose: () => void
}

export const AddArticoloModal = ({ idEvento, onClose }: Props) => {
  const [codArticolo, setCodArticolo] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const { mutate, isPending } = useAddArticolo(idEvento, () => onClose())

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!codArticolo) return
    mutate({ cod_articolo: codArticolo, note: note.trim() || null })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Aggiungi articolo</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Articolo */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Articolo <span className="text-red-500">*</span>
            </label>
            <ArticoloCombobox
              value={codArticolo}
              onChange={(cod) => setCodArticolo(cod)}
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note opzionali…"
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <p className="text-xs text-slate-500">
            Le quantità vengono calcolate automaticamente in base agli ospiti dell'evento.
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isPending || !codArticolo}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
            >
              {isPending ? 'Aggiunta…' : 'Aggiungi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

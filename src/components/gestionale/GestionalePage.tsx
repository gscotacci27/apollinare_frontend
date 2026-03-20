import { useState } from 'react'
import { Plus, Loader2, CalendarX } from 'lucide-react'
import { useEventi } from '@/hooks/useEventi'
import { useAuth } from '@/contexts/AuthContext'
import { FILTRI_STATO } from '@/types/gestionale'
import { EventCard } from './EventCard'
import { NuovoEventoModal } from './NuovoEventoModal'

export const GestionalePage = () => {
  const { isOrganizzatore } = useAuth()
  const [statoFilter, setStatoFilter] = useState<number | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

  const { data: eventi = [], isLoading, isError } = useEventi(statoFilter)

  const handleFilterChange = (value: number | undefined) => {
    // Il cambio di filtro svuota immediatamente la lista perché il queryKey cambia.
    // Non serve reset manuale: React Query gestisce la cache separata per chiave.
    setStatoFilter(value)
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-100">Eventi</h1>
          {!isLoading && (
            <p className="text-xs text-slate-500 mt-0.5">{eventi.length} evento{eventi.length !== 1 ? 'i' : ''}</p>
          )}
        </div>

        {isOrganizzatore && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuovo evento
          </button>
        )}
      </div>

      {/* Filtri stato */}
      <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-1.5 shrink-0 overflow-x-auto">
        {FILTRI_STATO.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => handleFilterChange(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statoFilter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Caricamento eventi…
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-sm">
            <p className="text-red-400">Errore nel caricamento degli eventi.</p>
            <p className="text-slate-500 text-xs">Verificare che il gestionale sia raggiungibile.</p>
          </div>
        ) : eventi.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-500">
            <CalendarX className="w-8 h-8 text-slate-700" />
            <p className="text-sm">Nessun evento trovato</p>
            {isOrganizzatore && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Crea il primo evento →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {eventi.map((e) => (
              <EventCard key={e.id} evento={e} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NuovoEventoModal
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

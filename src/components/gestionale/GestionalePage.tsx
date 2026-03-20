import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Loader2, CalendarX, ArrowUpDown } from 'lucide-react'
import { useEventi } from '@/hooks/useEventi'
import { useAuth } from '@/contexts/AuthContext'
import { FILTRI_STATO } from '@/types/gestionale'
import { EventCard } from './EventCard'
import { NuovoEventoModal } from './NuovoEventoModal'

export const GestionalePage = () => {
  const { isOrganizzatore } = useAuth()
  const [showModal, setShowModal] = useState(false)

  // Stato filtro e sort in URL → sopravvivono alla navigazione avanti/indietro
  const [searchParams, setSearchParams] = useSearchParams()
  const statoFilter = searchParams.get('stato') ? Number(searchParams.get('stato')) : undefined
  const sortOrder = (searchParams.get('sort') ?? 'asc') as 'asc' | 'desc'

  const { data: eventi = [], isLoading, isError } = useEventi(statoFilter)

  const eventiSorted = useMemo(() => {
    return [...eventi].sort((a, b) => {
      const da = a.data ?? ''
      const db = b.data ?? ''
      return sortOrder === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
    })
  }, [eventi, sortOrder])

  const handleFilterChange = (value: number | undefined) => {
    setSearchParams((p) => {
      if (value === undefined) p.delete('stato')
      else p.set('stato', String(value))
      return p
    })
  }

  const toggleSort = () => {
    setSearchParams((p) => {
      p.set('sort', sortOrder === 'asc' ? 'desc' : 'asc')
      return p
    })
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

        <div className="flex items-center gap-2">
          {/* Sort toggle */}
          <button
            onClick={toggleSort}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-md transition-colors"
            title={sortOrder === 'asc' ? 'Data crescente' : 'Data decrescente'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortOrder === 'asc' ? 'Prima i più vicini' : 'Prima i più lontani'}
          </button>

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
            {eventiSorted.map((e) => (
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

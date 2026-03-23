import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Loader2, CalendarX, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react'
import { useEventi } from '@/hooks/useEventi'
import { useAuth } from '@/contexts/AuthContext'
import { FILTRI_STATO } from '@/types/gestionale'
import { EventCard } from './EventCard'
import { NuovoEventoModal } from './NuovoEventoModal'
import { LocationCombobox } from './LocationCombobox'

export const GestionalePage = () => {
  const { isOrganizzatore } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Tutti i parametri in URL → sopravvivono alla navigazione avanti/indietro
  const [searchParams, setSearchParams] = useSearchParams()
  const statoFilter   = searchParams.get('stato') ?? undefined
  const sortOrder     = (searchParams.get('sort')      ?? 'asc') as 'asc' | 'desc'
  const dataDa        = searchParams.get('data_da')    ?? undefined
  const dataA         = searchParams.get('data_a')     ?? undefined
  const idLocation    = searchParams.get('id_location') ? Number(searchParams.get('id_location')) : undefined
  const isPassati     = searchParams.get('passati') === '1'

  // Per "Storico passati": data_a = oggi, stato = confermato
  // Normale: data_da = oggi di default (mostra eventi futuri)
  const today = new Date().toISOString().slice(0, 10)

  // dataDa è "attivo" solo se l'utente ha impostato una data diversa dal default (oggi)
  const hasActiveFilters = !!(
    (dataDa && dataDa !== today) || dataA || idLocation
  )

  const { data: eventi = [], isLoading, isError } = useEventi({
    stato:       isPassati ? 'confermato' : statoFilter,
    data_da:     isPassati ? undefined : (dataDa ?? today),
    data_a:      isPassati ? today : dataA,
    id_location: idLocation,
  })

  const eventiSorted = useMemo(() => {
    return [...eventi].sort((a, b) => {
      const da = a.data ?? ''
      const db = b.data ?? ''
      return sortOrder === 'asc' ? da.localeCompare(db) : db.localeCompare(da)
    })
  }, [eventi, sortOrder])

  const setParam = (key: string, value: string | undefined) => {
    setSearchParams((p) => {
      if (value === undefined || value === '') p.delete(key)
      else p.set(key, value)
      return p
    })
  }

  const clearFilters = () => {
    setSearchParams((p) => {
      p.delete('data_da')
      p.delete('data_a')
      p.delete('id_location')
      p.delete('stato')
      p.delete('passati')
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
            <p className="text-xs text-slate-500 mt-0.5">{eventi.length} event{eventi.length !== 1 ? 'i' : 'o'}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Filtri avanzati"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtri
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-0.5" />
            )}
          </button>

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
            onClick={() => {
              setSearchParams((p) => {
                p.delete('passati')
                if (f.value !== undefined) p.set('stato', String(f.value))
                else p.delete('stato')
                return p
              })
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !isPassati && statoFilter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px h-4 bg-slate-700 mx-1 shrink-0" />
        <button
          onClick={() => {
            setSearchParams((p) => {
              if (isPassati) p.delete('passati')
              else { p.set('passati', '1'); p.delete('stato') }
              return p
            })
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            isPassati
              ? 'bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          Storico
        </button>
      </div>

      {/* Filtri avanzati (data + location) */}
      {showFilters && (
        <div className="px-6 py-3 border-b border-slate-800 shrink-0 bg-slate-900/50">
          <div className="flex items-end gap-3 flex-wrap">
            {/* Data da */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Dal</label>
              <input
                type="date"
                value={dataDa ?? today}
                onChange={(e) => setParam('data_da', e.target.value || undefined)}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Data a */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Al</label>
              <input
                type="date"
                value={dataA ?? ''}
                onChange={(e) => setParam('data_a', e.target.value || undefined)}
                className="bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Location */}
            <div className="min-w-48">
              <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
              <LocationCombobox
                value={idLocation ?? null}
                onChange={(id) => setParam('id_location', id !== null ? String(id) : undefined)}
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-0.5"
              >
                <X className="w-3.5 h-3.5" />
                Rimuovi filtri
              </button>
            )}
          </div>
        </div>
      )}

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
            {isOrganizzatore && !hasActiveFilters && (
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

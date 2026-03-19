import { useState } from 'react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Users, MapPin, Loader2, Plus } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { useEventi } from '@/hooks/useEventi'
import { STATO_LABELS, STATI_FILTER } from '@/types/gestionale'
import { NuovoEventoModal } from './NuovoEventoModal'
import { EventoPanel } from './EventoPanel'
import type { Evento } from '@/types/gestionale'

function StatoBadge({ stato }: { stato: number }) {
  const s = STATO_LABELS[stato] ?? { label: String(stato), color: 'text-slate-400 bg-slate-100' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
  )
}

function EventoRow({ evento, onClick }: { evento: Evento; onClick: () => void }) {
  const dataStr = evento.data
    ? format(new Date(evento.data), 'd MMM yyyy', { locale: it })
    : '—'

  return (
    <tr
      className="border-b border-slate-100 hover:bg-indigo-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{dataStr}</td>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-slate-800">{evento.cliente ?? '—'}</div>
        {evento.descrizione && (
          <div className="text-xs text-slate-400 truncate max-w-[200px]">{evento.descrizione}</div>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{evento.descrizione_tipo ?? evento.cod_tipo ?? '—'}</td>
      <td className="px-4 py-3">
        {evento.location ? (
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {evento.location}
          </span>
        ) : (
          <span className="text-sm text-slate-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {evento.tot_ospiti != null ? (
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Users className="w-3.5 h-3.5 shrink-0" />
            {evento.tot_ospiti}
          </span>
        ) : (
          <span className="text-sm text-slate-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatoBadge stato={evento.stato} />
      </td>
    </tr>
  )
}

export const GestionalePage = () => {
  const [statoFilter, setStatoFilter] = useState<number | undefined>(undefined)
  const [showNuovoEvento, setShowNuovoEvento] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: eventi = [], isLoading, isError } = useEventi(statoFilter)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Gestionale" count={eventi.length} />

      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">Stato:</span>
        <div className="flex items-center gap-1 flex-1 flex-wrap">
          {STATI_FILTER.map((s) => (
            <button
              key={String(s.value)}
              onClick={() => setStatoFilter(s.value)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                statoFilter === s.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNuovoEvento(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Nuovo evento
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Caricamento eventi…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full text-sm text-red-400">
            Errore nel caricamento. Verificare che il gestionale sia raggiungibile.
          </div>
        ) : eventi.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            Nessun evento trovato.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Data</th>
                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Cliente</th>
                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Location</th>
                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Ospiti</th>
                <th className="px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">Stato</th>
              </tr>
            </thead>
            <tbody>
              {eventi.map((e) => (
                <EventoRow key={e.id} evento={e} onClick={() => setSelectedId(e.id)} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNuovoEvento && <NuovoEventoModal onClose={() => setShowNuovoEvento(false)} />}
      {selectedId != null && (
        <EventoPanel idEvento={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}

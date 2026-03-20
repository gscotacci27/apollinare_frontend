import { useNavigate } from 'react-router-dom'
import { Users, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { StatusBadge } from './StatusBadge'
import type { EventoResponse } from '@/types/gestionale'

interface Props {
  evento: EventoResponse
}

export const EventCard = ({ evento }: Props) => {
  const navigate = useNavigate()

  const dataFormattata = evento.data
    ? format(parseISO(evento.data), 'd MMMM yyyy', { locale: it })
    : '—'

  return (
    <button
      onClick={() => navigate(`/gestionale/eventi/${evento.id}`)}
      className="w-full text-left bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 hover:border-slate-600 hover:bg-slate-800/60 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Titolo: data · location · ospiti + stato */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-slate-100">
              {dataFormattata}
              {evento.location_nome && <span className="text-slate-400"> · {evento.location_nome}</span>}
              {evento.tot_ospiti != null && (
                <span className="text-slate-400"> · <Users className="w-3.5 h-3.5 inline -mt-0.5" /> {evento.tot_ospiti}</span>
              )}
            </span>
            <StatusBadge stato={evento.stato} />
          </div>

          {/* Sottotitolo: cliente — descrizione */}
          {(evento.cliente || evento.descrizione) && (
            <p className="text-sm text-slate-400 truncate">
              {[evento.cliente, evento.descrizione].filter(Boolean).join(' — ')}
            </p>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
      </div>
    </button>
  )
}

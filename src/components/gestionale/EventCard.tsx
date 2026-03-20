import { useNavigate } from 'react-router-dom'
import { MapPin, Users, ChevronRight } from 'lucide-react'
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
          {/* Titolo + stato */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-slate-100 truncate">
              {evento.descrizione ?? '(senza titolo)'}
            </span>
            <StatusBadge stato={evento.stato} />
          </div>

          {/* Data */}
          <p className="text-sm text-slate-400">{dataFormattata}</p>

          {/* Metadati secondari */}
          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
            {evento.location_nome && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {evento.location_nome}
              </span>
            )}
            {evento.tot_ospiti != null && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 shrink-0" />
                {evento.tot_ospiti} ospiti
              </span>
            )}
            {evento.cliente && (
              <span className="truncate">{evento.cliente}</span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
      </div>
    </button>
  )
}

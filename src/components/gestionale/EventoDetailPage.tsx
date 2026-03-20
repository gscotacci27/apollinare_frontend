import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ClipboardList, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getEvento } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import { StatusBadge } from './StatusBadge'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

export const EventoDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const idNum = Number(id)

  const { data: evento, isLoading, isError } = useQuery({
    queryKey: queryKeys.eventi.detail(idNum),
    queryFn: () => getEvento(idNum),
    enabled: !isNaN(idNum),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 text-sm">
        Caricamento…
      </div>
    )
  }

  if (isError || !evento) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-red-400 text-sm">Evento non trovato</p>
        <button onClick={() => navigate(-1)} className="text-xs text-indigo-400 hover:text-indigo-300">
          ← Torna agli eventi
        </button>
      </div>
    )
  }

  const dataFormattata = evento.data
    ? format(parseISO(evento.data), 'd MMMM yyyy', { locale: it })
    : '—'

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/gestionale')}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-semibold text-slate-100 truncate">
              {evento.descrizione ?? '(senza titolo)'}
            </h1>
            <StatusBadge stato={evento.stato} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{dataFormattata}</p>
        </div>
      </div>

      {/* Info riepilogative */}
      <div className="px-6 py-4 border-b border-slate-800 grid grid-cols-2 gap-4 text-sm shrink-0">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Location</p>
          <p className="text-slate-200">{evento.location_nome ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Cliente</p>
          <p className="text-slate-200">{evento.cliente ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Ora</p>
          <p className="text-slate-200">{evento.ora_evento ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Ospiti</p>
          <p className="text-slate-200">{evento.tot_ospiti ?? '—'}</p>
        </div>
      </div>

      {/* Accessi ai moduli (SF-002, SF-003 — da implementare) */}
      <div className="px-6 py-4 space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Moduli</p>

        <Link
          to={`/gestionale/eventi/${idNum}/lista-carico`}
          className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 transition-colors group"
        >
          <ClipboardList className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          <div>
            <p className="text-sm text-slate-200">Lista di carico</p>
            <p className="text-xs text-slate-500">Articoli e materiali pianificati</p>
          </div>
          <span className="ml-auto text-slate-600 text-sm">→</span>
        </Link>

        <Link
          to={`/gestionale/eventi/${idNum}/dettagli`}
          className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 transition-colors group"
        >
          <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          <div>
            <p className="text-sm text-slate-200">Scheda evento</p>
            <p className="text-xs text-slate-500">Menu, mise en place, ospiti, preventivo — SF-003</p>
          </div>
          <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </Link>
      </div>
    </div>
  )
}

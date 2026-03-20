import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ClipboardList, FileText, Pencil, X, Save, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getEvento, getLocation } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import { StatusBadge } from './StatusBadge'
import { usePatchEvento } from '@/hooks/usePatchEvento'
import { STATI_GESTIBILI } from '@/types/gestionale'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

// ── Pannello modifica evento ───────────────────────────────────────────────────

interface EditPanelProps {
  idEvento: number
  initial: {
    stato: number
    descrizione: string | null
    cliente: string | null
    data: string | null
    ora_evento: string | null
    id_location: number | null
    tot_ospiti: number | null
    perc_sedute_aper: number | null
  }
  locations: { id: number; location: string }[]
  onClose: () => void
}

const EditPanel = ({ idEvento, initial, locations, onClose }: EditPanelProps) => {
  const [stato,       setStato]       = useState(initial.stato)
  const [descrizione, setDescrizione] = useState(initial.descrizione ?? '')
  const [cliente,     setCliente]     = useState(initial.cliente ?? '')
  const [data,        setData]        = useState(initial.data ?? '')
  const [ora,         setOra]         = useState(initial.ora_evento ?? '')
  const [location,    setLocation]    = useState<number | ''>(initial.id_location ?? '')
  const [ospiti,      setOspiti]      = useState(initial.tot_ospiti ?? 0)
  const [perc,        setPerc]        = useState(initial.perc_sedute_aper ?? 0)

  const { mutate, isPending } = usePatchEvento(idEvento, onClose)

  const save = () => {
    mutate({
      stato,
      descrizione: descrizione || null,
      cliente:     cliente     || null,
      data:        data        || null,
      ora_evento:  ora         || null,
      id_location: location !== '' ? location : null,
      tot_ospiti:  ospiti,
      perc_sedute_aper: perc,
    })
  }

  const field = (lbl: string, children: React.ReactNode) => (
    <div>
      <p className="text-xs text-slate-500 mb-1">{lbl}</p>
      {children}
    </div>
  )

  const cls = "w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"

  return (
    <div className="px-6 py-4 border-b border-slate-800 space-y-3 bg-indigo-950/20">
      <div className="grid grid-cols-2 gap-3">
        {field('Stato',
          <select value={stato} onChange={(e) => setStato(Number(e.target.value))} className={cls}>
            {STATI_GESTIBILI.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        )}
        {field('Data',
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={cls} />
        )}
        {field('Descrizione',
          <input type="text" value={descrizione} onChange={(e) => setDescrizione(e.target.value)} className={cls} />
        )}
        {field('Cliente',
          <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className={cls} />
        )}
        {field('Ora',
          <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} className={cls} />
        )}
        {field('Location',
          <select value={location} onChange={(e) => setLocation(e.target.value ? Number(e.target.value) : '')} className={cls}>
            <option value="">— nessuna —</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.location}</option>
            ))}
          </select>
        )}
        {field('Ospiti totali',
          <input type="number" min={0} step={1} value={ospiti} onChange={(e) => setOspiti(Number(e.target.value))} className={cls} />
        )}
        {field('% in piedi (aper.)',
          <input type="number" min={0} max={100} step={1} value={perc} onChange={(e) => setPerc(Number(e.target.value))} className={cls} />
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-md transition-colors">
          <X className="w-3.5 h-3.5 inline mr-1" />Annulla
        </button>
        <button onClick={save} disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50">
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Salva
        </button>
      </div>
    </div>
  )
}

// ── Pagina ─────────────────────────────────────────────────────────────────────

export const EventoDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const idNum = Number(id)
  const [editing, setEditing] = useState(false)

  const { data: evento, isLoading, isError } = useQuery({
    queryKey: queryKeys.eventi.detail(idNum),
    queryFn: () => getEvento(idNum),
    enabled: !isNaN(idNum),
  })

  const { data: locations = [] } = useQuery({
    queryKey: queryKeys.lookup.location,
    queryFn: getLocation,
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
              {evento.descrizione ?? evento.cliente ?? '(senza titolo)'}
            </h1>
            <StatusBadge stato={evento.stato} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{dataFormattata}</p>
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className={`p-1.5 rounded transition-colors ${
            editing
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title="Modifica evento"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {/* Pannello modifica (inline) */}
      {editing && (
        <EditPanel
          idEvento={idNum}
          initial={evento}
          locations={locations}
          onClose={() => setEditing(false)}
        />
      )}

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

      {/* Accessi ai moduli */}
      <div className="px-6 py-4 space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Moduli</p>

        {evento.stato === 400 ? (
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
        ) : (
          <div
            className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors"
            onClick={() => setEditing(true)}
            title="Conferma l'evento per sbloccare la lista di carico"
          >
            <ClipboardList className="w-4 h-4 text-slate-600" />
            <div>
              <p className="text-sm text-slate-400">Lista di carico</p>
              <p className="text-xs text-slate-600">Conferma l'evento (stato → Confermato) per sbloccare</p>
            </div>
            <span className="ml-auto text-xs text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Modifica evento
            </span>
          </div>
        )}

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

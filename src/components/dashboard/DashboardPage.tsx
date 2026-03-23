import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Loader2, CalendarDays, ClipboardList, Package, TrendingUp, AlertTriangle, Activity } from 'lucide-react'
import {
  getDashboardKpi, getProssimiEventi, getListeAperte,
  getCaricoLavoro, getArticoliSottoScorta, getAttivitaRecenti,
} from '@/services/dashboard'
import { queryKeys } from '@/services/queryKeys'
import { STATO_CONFIG } from '@/types/gestionale'

const STALE = 60_000 // 1 min

// ── helpers ────────────────────────────────────────────────────────────────────

function fmtData(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function statoLabel(stato: string): string {
  return STATO_CONFIG[stato]?.label ?? stato
}

function StatoBadge({ stato }: { stato: string }) {
  const cfg = STATO_CONFIG[stato] ?? { bg: 'bg-slate-100', text: 'text-slate-600', label: stato }
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

function ScortaBadge({ perc }: { perc: number }) {
  if (perc >= 90) return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-400">Critico {perc.toFixed(0)}%</span>
  if (perc >= 75) return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400">Scarso {perc.toFixed(0)}%</span>
  return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">Attenzione {perc.toFixed(0)}%</span>
}

function WidgetShell({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Spinner() {
  return <div className="flex items-center justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-slate-600" /></div>
}

// ── KPI cards ─────────────────────────────────────────────────────────────────

function KpiCards() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.kpi,
    queryFn: getDashboardKpi,
    staleTime: STALE,
  })

  const cards = [
    { label: 'Eventi attivi', value: data?.eventi_attivi, icon: <CalendarDays className="w-5 h-5" />, color: 'text-indigo-400' },
    { label: 'Liste di carico', value: data?.liste_aperte, icon: <ClipboardList className="w-5 h-5" />, color: 'text-amber-400' },
    { label: 'Articoli', value: data?.articoli_totali, icon: <Package className="w-5 h-5" />, color: 'text-emerald-400' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <span className={c.color}>{c.icon}</span>
          <div>
            {isLoading ? (
              <div className="h-6 w-10 bg-slate-800 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-xl font-semibold text-slate-100">{c.value ?? '—'}</p>
            )}
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Prossimi eventi ───────────────────────────────────────────────────────────

function ProssimiEventi() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard.prossimiEventi,
    queryFn: getProssimiEventi,
    staleTime: STALE,
  })

  return (
    <WidgetShell title="Prossimi eventi" icon={<CalendarDays className="w-4 h-4" />}>
      {isLoading ? <Spinner /> : data.length === 0 ? (
        <p className="text-xs text-slate-600 py-4 text-center">Nessun evento in programma</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-600 border-b border-slate-800">
              <th className="text-left pb-1.5 font-medium">Data</th>
              <th className="text-left pb-1.5 font-medium">Evento</th>
              <th className="text-left pb-1.5 font-medium">Location</th>
              <th className="text-right pb-1.5 font-medium">Ospiti</th>
              <th className="text-right pb-1.5 font-medium">Stato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                onClick={() => navigate(`/gestionale/eventi/${e.id}`)}
              >
                <td className="py-2 text-slate-300 whitespace-nowrap">{fmtData(e.data)}</td>
                <td className="py-2 text-slate-200 max-w-[140px] truncate pr-2">
                  {e.descrizione ?? e.cliente ?? '—'}
                </td>
                <td className="py-2 text-slate-400 max-w-[100px] truncate pr-2">{e.location_nome ?? '—'}</td>
                <td className="py-2 text-slate-400 text-right">{e.tot_ospiti ?? '—'}</td>
                <td className="py-2 text-right"><StatoBadge stato={e.stato} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </WidgetShell>
  )
}

// ── Liste aperte ──────────────────────────────────────────────────────────────

function ListeAperte() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard.listeAperte,
    queryFn: getListeAperte,
    staleTime: STALE,
  })

  return (
    <WidgetShell title="Liste di carico aperte" icon={<ClipboardList className="w-4 h-4" />}>
      {isLoading ? <Spinner /> : data.length === 0 ? (
        <p className="text-xs text-slate-600 py-4 text-center">Nessuna lista attiva</p>
      ) : (
        <ul className="space-y-1.5">
          {data.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800/60 cursor-pointer transition-colors"
              onClick={() => navigate(`/gestionale/eventi/${e.id}/lista-carico`)}
            >
              <div className="min-w-0">
                <p className="text-xs text-slate-200 truncate">{e.descrizione ?? e.cliente ?? `Evento ${e.id}`}</p>
                <p className="text-[10px] text-slate-500">{fmtData(e.data)} · {e.location_nome ?? '—'}</p>
              </div>
              <StatoBadge stato={e.stato} />
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  )
}

// ── Carico di lavoro chart ────────────────────────────────────────────────────

const BAR_COLORS = {
  preventivo:    { bar: 'bg-slate-500',  dot: 'bg-slate-500',  label: 'Preventivo' },
  in_lavorazione:{ bar: 'bg-amber-500',  dot: 'bg-amber-500',  label: 'In lavorazione' },
  confermato:    { bar: 'bg-indigo-500', dot: 'bg-indigo-500', label: 'Confermato' },
} as const

function CaricoLavoro() {
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard.caricoLavoro,
    queryFn: getCaricoLavoro,
    staleTime: STALE,
  })

  const maxVal = Math.max(...data.map((d) => d.preventivo + d.in_lavorazione + d.confermato), 1)

  function fmtSettimana(s: string) {
    // "2026-W12" → "W12"
    return s.split('-')[1] ?? s
  }

  return (
    <WidgetShell title="Carico di lavoro" icon={<TrendingUp className="w-4 h-4" />}>
      {isLoading ? <Spinner /> : data.length === 0 ? (
        <p className="text-xs text-slate-600 py-4 text-center">Nessun evento nelle prossime 8 settimane</p>
      ) : (
        <>
          <div className="flex items-end gap-1.5 h-24">
            {data.map((d) => {
              const total = d.preventivo + d.in_lavorazione + d.confermato
              const heightPx = Math.max((total / maxVal) * 96, 4)
              return (
                <div key={d.settimana} className="flex-1 flex flex-col items-center gap-0.5 group">
                  <div
                    className="w-full relative flex flex-col-reverse rounded-sm overflow-hidden"
                    style={{ height: heightPx }}
                    title={`${fmtSettimana(d.settimana)}: ${total} eventi`}
                  >
                    {d.confermato > 0 && (
                      <div
                        className="w-full bg-indigo-500"
                        style={{ height: `${(d.confermato / total) * 100}%` }}
                      />
                    )}
                    {d.in_lavorazione > 0 && (
                      <div
                        className="w-full bg-amber-500"
                        style={{ height: `${(d.in_lavorazione / total) * 100}%` }}
                      />
                    )}
                    {d.preventivo > 0 && (
                      <div
                        className="w-full bg-slate-500"
                        style={{ height: `${(d.preventivo / total) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors">
                    {fmtSettimana(d.settimana)}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {(Object.keys(BAR_COLORS) as Array<keyof typeof BAR_COLORS>).map((k) => (
              <div key={k} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-sm ${BAR_COLORS[k].dot}`} />
                <span className="text-[10px] text-slate-500">{BAR_COLORS[k].label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </WidgetShell>
  )
}

// ── Articoli sotto scorta ─────────────────────────────────────────────────────

const SCORTA_PRESET = [
  { label: 'Oggi', giorni: 1 },
  { label: '7g',   giorni: 7 },
  { label: '30g',  giorni: 30 },
  { label: '60g',  giorni: 60 },
  { label: '90g',  giorni: 90 },
] as const

function ArticoliSottoScorta() {
  const [giorni, setGiorni] = useState(30)
  const [dataSpecifica, setDataSpecifica] = useState('')

  const opts = dataSpecifica ? { data: dataSpecifica } : { giorni }

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard.articoliSottoScorta(opts.giorni, opts.data),
    queryFn: () => getArticoliSottoScorta(opts),
    staleTime: STALE,
  })

  const labelFinestra = dataSpecifica
    ? fmtData(dataSpecifica)
    : giorni === 1 ? 'oggi' : `prossimi ${giorni}gg`

  return (
    <WidgetShell title="Articoli sotto scorta" icon={<AlertTriangle className="w-4 h-4" />}>
      {/* Selettore finestra */}
      <div className="flex items-center gap-1 flex-wrap">
        {SCORTA_PRESET.map((p) => (
          <button
            key={p.giorni}
            onClick={() => { setGiorni(p.giorni); setDataSpecifica('') }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              !dataSpecifica && giorni === p.giorni
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {p.label}
          </button>
        ))}
        <input
          type="date"
          value={dataSpecifica}
          onChange={(e) => setDataSpecifica(e.target.value)}
          className={`ml-auto bg-slate-800 border rounded px-1.5 py-0.5 text-[10px] text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors ${
            dataSpecifica ? 'border-indigo-500 text-slate-200' : 'border-slate-700'
          }`}
        />
      </div>

      {isLoading ? <Spinner /> : data.length === 0 ? (
        <p className="text-xs text-slate-600 py-3 text-center">Nessun articolo critico ({labelFinestra})</p>
      ) : (
        <ul className="space-y-1.5">
          {data.map((a) => (
            <li key={a.cod_articolo} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-200 truncate">{a.descrizione ?? a.cod_articolo}</p>
                <p className="text-[10px] text-slate-500">
                  {a.qta_impegnata.toFixed(0)} imp. · {a.qta_giac.toFixed(0)} in stock
                </p>
              </div>
              <ScortaBadge perc={a.perc_impegnata} />
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  )
}

// ── Attività recenti ──────────────────────────────────────────────────────────

function AttivitaRecenti() {
  const navigate = useNavigate()
  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.dashboard.attivitaRecenti,
    queryFn: getAttivitaRecenti,
    staleTime: STALE,
  })

  return (
    <WidgetShell title="Attività recenti" icon={<Activity className="w-4 h-4" />}>
      {isLoading ? <Spinner /> : data.length === 0 ? (
        <p className="text-xs text-slate-600 py-4 text-center">Nessuna attività</p>
      ) : (
        <ul className="space-y-1.5">
          {data.map((a, i) => (
            <li
              key={`${a.tipo}-${a.id}-${i}`}
              className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800/60 cursor-pointer transition-colors"
              onClick={() => {
                const evId = a.tipo === 'acconto' ? a.id_evento : a.id
                if (evId) navigate(`/gestionale/eventi/${evId}`)
              }}
            >
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                a.tipo === 'acconto' ? 'bg-emerald-500' : 'bg-indigo-500'
              }`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-200 truncate">
                  {a.tipo === 'acconto'
                    ? `Acconto €${(a.importo ?? 0).toFixed(0)} — ${a.descrizione ?? a.cliente ?? '—'}`
                    : (a.descrizione ?? a.cliente ?? `Evento ${a.id}`)
                  }
                </p>
                <p className="text-[10px] text-slate-500">
                  {fmtData(a.data)}
                  {a.tipo === 'evento' && a.stato !== undefined && (
                    <> · {statoLabel(a.stato)}</>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const DashboardPage = () => {
  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 shrink-0">
        <h1 className="text-sm font-semibold text-slate-100">Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Panoramica operativa</p>
      </div>

      <div className="flex-1 px-6 py-5 space-y-5">
        {/* KPI */}
        <KpiCards />

        {/* Row 2: Prossimi eventi + Carico lavoro */}
        <div className="grid grid-cols-2 gap-4">
          <ProssimiEventi />
          <CaricoLavoro />
        </div>

        {/* Row 3: Liste aperte + Articoli sotto scorta + Attività recenti */}
        <div className="grid grid-cols-3 gap-4">
          <ListeAperte />
          <ArticoliSottoScorta />
          <AttivitaRecenti />
        </div>
      </div>
    </div>
  )
}

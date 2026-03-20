import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Save, RotateCcw, Trash2, Plus, X, Pencil, Check,
} from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  getEvento,
  getScheda,
  updateOspite,
  addExtra,
  deleteExtra,
  addAcconto,
  deleteAcconto,
  addDegustazione,
  deleteDegustazione,
  updateSconto,
  updateTotaleManuale,
  salvaScheda,
  ricaricaScheda,
} from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import type { OspiteItem, ExtraItem, AccontoItem, DegustazioneItem, PreventivoCalc, SchedaResponse } from '@/types/gestionale'
import toast from 'react-hot-toast'

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmtEuro = (n: number) =>
  n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 })

// ── Preventivo card ────────────────────────────────────────────────────────────

interface PreventivoCardProps {
  prev: PreventivoCalc
  idEvento: number
  onDirty: () => void
  onScontoChange: (v: number) => void
  onTotaleChange: (v: number | null) => void
}

const PreventivoCard = ({ prev, idEvento, onDirty, onScontoChange, onTotaleChange }: PreventivoCardProps) => {
  const [editSconto, setEditSconto] = useState(false)
  const [scontoVal, setScontoVal]   = useState(prev.sconto_totale)
  const [editTotale, setEditTotale] = useState(false)
  const [totaleVal, setTotaleVal]   = useState(prev.totale_manuale ?? prev.totale_netto)

  const { mutate: doSconto } = useMutation({
    mutationFn: (v: number) => updateSconto(idEvento, v),
    onSuccess: (_d, v) => { onScontoChange(v); onDirty(); setEditSconto(false) },
    onError: () => toast.error('Errore salvataggio sconto'),
  })
  const { mutate: doTotale } = useMutation({
    mutationFn: (v: number | null) => updateTotaleManuale(idEvento, v),
    onSuccess: (_d, v) => { onTotaleChange(v); onDirty(); setEditTotale(false) },
    onError: () => toast.error('Errore salvataggio totale'),
  })

  const cells = [
    { label: 'Ospiti',     value: prev.ospiti_subtotale },
    { label: 'Articoli',   value: prev.articoli_subtotale },
    { label: 'Extra',      value: prev.extra_subtotale },
    ...(prev.degustazioni_detraibili > 0
      ? [{ label: 'Degust. −', value: -prev.degustazioni_detraibili }]
      : []),
    { label: 'Acconti',    value: prev.acconti_totale },
    { label: 'Saldo', value: prev.saldo, highlight: true },
  ]

  return (
    <div className="mx-5 my-3 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
      {/* Riga cifre */}
      <div className={`grid divide-x divide-slate-800 text-center text-xs`}
           style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
        {cells.map(({ label, value, highlight }) => (
          <div key={label} className="px-2 py-2.5">
            <p className="text-slate-500 uppercase tracking-wide text-[10px] mb-1">{label}</p>
            <p className={`font-semibold tabular-nums text-sm ${
              highlight
                ? value >= 0 ? 'text-emerald-400' : 'text-red-400'
                : value < 0 ? 'text-red-400' : 'text-slate-200'
            }`}>
              {fmtEuro(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Riga totale + sconto + totale manuale */}
      <div className="border-t border-slate-800 px-4 py-2.5 flex items-center gap-4 flex-wrap">
        {/* Totale calcolato / manuale */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-slate-500 uppercase tracking-wide shrink-0">Totale</span>
          {editTotale ? (
            <div className="flex items-center gap-1">
              <input
                type="number" step={0.01} value={totaleVal} autoFocus
                onChange={(e) => setTotaleVal(parseFloat(e.target.value) || 0)}
                className="w-28 bg-slate-800 border border-indigo-500 rounded px-2 py-0.5 text-sm text-slate-100 text-right tabular-nums focus:outline-none"
              />
              <button onClick={() => doTotale(totaleVal)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { doTotale(null); setTotaleVal(prev.totale_netto) }} className="p-1 text-slate-500 hover:bg-slate-700 rounded text-[10px]">
                Reset
              </button>
              <button onClick={() => setEditTotale(false)} className="p-1 text-slate-500 hover:bg-slate-700 rounded">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`font-semibold tabular-nums text-sm ${prev.totale_manuale != null ? 'text-amber-400' : 'text-slate-200'}`}>
                {fmtEuro(prev.totale_netto)}
                {prev.totale_manuale != null && <span className="text-[10px] text-amber-500 ml-1">(manuale)</span>}
              </span>
              <button onClick={() => { setTotaleVal(prev.totale_manuale ?? prev.totale_netto); setEditTotale(true) }}
                      className="p-0.5 text-slate-600 hover:text-slate-400 rounded">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-slate-700 shrink-0" />

        {/* Sconto */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide shrink-0">Sconto €</span>
          {editSconto ? (
            <div className="flex items-center gap-1">
              <input
                type="number" min={0} step={0.01} value={scontoVal} autoFocus
                onChange={(e) => setScontoVal(parseFloat(e.target.value) || 0)}
                className="w-24 bg-slate-800 border border-indigo-500 rounded px-2 py-0.5 text-sm text-slate-100 text-right tabular-nums focus:outline-none"
              />
              <button onClick={() => doSconto(scontoVal)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditSconto(false)} className="p-1 text-slate-500 hover:bg-slate-700 rounded">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className={`font-semibold tabular-nums text-sm ${prev.sconto_totale > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                {fmtEuro(prev.sconto_totale)}
              </span>
              <button onClick={() => { setScontoVal(prev.sconto_totale); setEditSconto(true) }}
                      className="p-0.5 text-slate-600 hover:text-slate-400 rounded">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sezione Ospiti ─────────────────────────────────────────────────────────────

interface OspitiSectionProps {
  idEvento: number
  ospiti: OspiteItem[]
  onDirty: () => void
  onUpdate: (codTipo: string, partial: Partial<OspiteItem>) => void
}

const OspitiSection = ({ idEvento, ospiti, onDirty, onUpdate }: OspitiSectionProps) => {
  const { mutate: doUpdate } = useMutation({
    mutationFn: ({ codTipo, body }: { codTipo: string; body: Parameters<typeof updateOspite>[2] }) =>
      updateOspite(idEvento, codTipo, body),
    onError: () => toast.error('Errore aggiornamento ospite'),
  })

  const handleChange = (o: OspiteItem, key: keyof OspiteItem, raw: string) => {
    const numVal = parseFloat(raw) || 0
    const strVal = raw
    const partial: Partial<OspiteItem> = key === 'note' ? { note: strVal || null } : { [key]: numVal }
    onUpdate(o.cod_tipo, partial)
    onDirty()

    const updated = { ...o, ...partial }
    doUpdate({
      codTipo: o.cod_tipo,
      body: {
        numero: updated.numero,
        costo: updated.costo,
        sconto: updated.sconto,
        note: updated.note,
      },
    })
  }

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500 tabular-nums"

  return (
    <div className="mx-5 mb-4 shrink-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Ospiti</p>
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 border-b border-slate-800">
            <tr>
              <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Tipo</th>
              <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-20">N°</th>
              <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-24">Costo/p</th>
              <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-20">Sconto%</th>
              <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-28">Subtotale</th>
              <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {ospiti.map((o) => {
              const sub = o.numero * o.costo * (1 - o.sconto / 100)
              return (
                <tr key={o.cod_tipo} className="border-b border-slate-800/50 last:border-0">
                  <td className="px-3 py-2">
                    <p className="text-slate-200">{o.descrizione ?? o.cod_tipo}</p>
                    <p className="text-xs text-slate-600">{o.cod_tipo}</p>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number" min={0} step={1} value={o.numero}
                      onChange={(e) => handleChange(o, 'numero', e.target.value)}
                      className={inputCls}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number" min={0} step={0.01} value={o.costo}
                      onChange={(e) => handleChange(o, 'costo', e.target.value)}
                      className={inputCls}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number" min={0} max={100} step={1} value={o.sconto}
                      onChange={(e) => handleChange(o, 'sconto', e.target.value)}
                      className={inputCls}
                    />
                  </td>
                  <td className="px-2 py-2 text-center text-slate-300 tabular-nums text-sm">
                    {fmtEuro(sub)}
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text" value={o.note ?? ''}
                      onChange={(e) => handleChange(o, 'note', e.target.value)}
                      placeholder="Note…"
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Sezione Extra ──────────────────────────────────────────────────────────────

interface ExtraSectionProps {
  idEvento: number
  extra: ExtraItem[]
  onDirty: () => void
  onAdded: (item: ExtraItem) => void
  onDeleted: (id: number) => void
}

const ExtraSection = ({ idEvento, extra, onDirty, onAdded, onDeleted }: ExtraSectionProps) => {
  const [descr, setDescr] = useState('')
  const [costo, setCosto] = useState(0)
  const [qty, setQty]     = useState(1)
  const [adding, setAdding] = useState(false)

  const { mutate: doAdd, isPending: isAdding } = useMutation({
    mutationFn: () => addExtra(idEvento, { descrizione: descr, costo, quantity: qty }),
    onSuccess: (item) => {
      onAdded(item)
      onDirty()
      setDescr('')
      setCosto(0)
      setQty(1)
      setAdding(false)
    },
    onError: () => toast.error('Errore aggiunta extra'),
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: (id: number) => deleteExtra(idEvento, id),
    onSuccess: (_data, id) => {
      onDeleted(id)
      onDirty()
    },
    onError: () => toast.error('Errore eliminazione extra'),
  })

  return (
    <div className="mx-5 mb-4 shrink-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Extra costi</p>
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        {extra.length === 0 && !adding ? (
          <p className="text-xs text-slate-600 px-4 py-3">Nessun extra aggiunto</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium">Descrizione</th>
                <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-24">Costo</th>
                <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-16">Qty</th>
                <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-28">Subtotale</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {extra.map((e) => (
                <tr key={e.id} className="border-b border-slate-800/50 last:border-0 group">
                  <td className="px-3 py-2 text-slate-200">{e.descrizione}</td>
                  <td className="px-2 py-2 text-center text-slate-300 tabular-nums">{fmtEuro(e.costo)}</td>
                  <td className="px-2 py-2 text-center text-slate-300 tabular-nums">{e.quantity}</td>
                  <td className="px-2 py-2 text-center text-slate-300 tabular-nums">{fmtEuro(e.costo * e.quantity)}</td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => doDelete(e.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {adding && (
          <div className="px-3 py-3 border-t border-slate-800 flex items-end gap-2 flex-wrap bg-slate-900/50">
            <div className="flex-1 min-w-40">
              <p className="text-xs text-slate-500 mb-1">Descrizione</p>
              <input
                type="text" value={descr} onChange={(e) => setDescr(e.target.value)}
                placeholder="Descrizione extra…" autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="w-24">
              <p className="text-xs text-slate-500 mb-1">Costo (€)</p>
              <input
                type="number" min={0} step={0.01} value={costo}
                onChange={(e) => setCosto(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500 tabular-nums"
              />
            </div>
            <div className="w-16">
              <p className="text-xs text-slate-500 mb-1">Qty</p>
              <input
                type="number" min={1} step={1} value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500 tabular-nums"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => doAdd()}
                disabled={isAdding || !descr.trim()}
                className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
              <button onClick={() => setAdding(false)} className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="px-3 py-2 border-t border-slate-800">
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Aggiungi extra
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sezione Acconti ────────────────────────────────────────────────────────────

interface AccontiSectionProps {
  idEvento: number
  acconti: AccontoItem[]
  onDirty: () => void
  onAdded: (item: AccontoItem) => void
  onDeleted: (id: number) => void
}

const AccontiSection = ({ idEvento, acconti, onDirty, onAdded, onDeleted }: AccontiSectionProps) => {
  const [importo, setImporto]   = useState(0)
  const [data, setData]         = useState('')
  const [descrizione, setDescr] = useState('')
  const [aConf, setAConf]       = useState(false)
  const [adding, setAdding]     = useState(false)

  const { mutate: doAdd, isPending: isAdding } = useMutation({
    mutationFn: () =>
      addAcconto(idEvento, {
        acconto: importo,
        data: data || null,
        a_conferma: aConf ? 1 : 0,
        descrizione: descrizione || null,
      }),
    onSuccess: (item) => {
      onAdded(item)
      onDirty()
      setImporto(0)
      setData('')
      setDescr('')
      setAConf(false)
      setAdding(false)
    },
    onError: () => toast.error('Errore aggiunta acconto'),
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: (id: number) => deleteAcconto(idEvento, id),
    onSuccess: (_data, id) => {
      onDeleted(id)
      onDirty()
    },
    onError: () => toast.error('Errore eliminazione acconto'),
  })

  return (
    <div className="mx-5 mb-4 shrink-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Acconti</p>
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        {acconti.length === 0 && !adding ? (
          <p className="text-xs text-slate-600 px-4 py-3">Nessun acconto registrato</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium w-32">Importo</th>
                <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium w-28">Data</th>
                <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Descrizione</th>
                <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-24">A conferma</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {acconti.map((a) => (
                <tr key={a.id} className="border-b border-slate-800/50 last:border-0 group">
                  <td className="px-3 py-2 text-slate-200 tabular-nums font-medium">{fmtEuro(a.acconto)}</td>
                  <td className="px-2 py-2 text-slate-400 text-xs">{a.data ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-400 text-xs">{a.descrizione ?? '—'}</td>
                  <td className="px-2 py-2 text-center">
                    {a.a_conferma ? (
                      <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Sì
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">No</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => doDelete(a.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {adding && (
          <div className="px-3 py-3 border-t border-slate-800 flex items-end gap-2 flex-wrap bg-slate-900/50">
            <div className="w-28">
              <p className="text-xs text-slate-500 mb-1">Importo (€)</p>
              <input
                type="number" min={0} step={0.01} value={importo} autoFocus
                onChange={(e) => setImporto(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500 tabular-nums"
              />
            </div>
            <div className="w-36">
              <p className="text-xs text-slate-500 mb-1">Data</p>
              <input
                type="date" value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-1 min-w-32">
              <p className="text-xs text-slate-500 mb-1">Descrizione</p>
              <input
                type="text" value={descrizione}
                onChange={(e) => setDescr(e.target.value)}
                placeholder="Descrizione…"
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox" id="a_conf" checked={aConf}
                onChange={(e) => setAConf(e.target.checked)}
                className="w-3.5 h-3.5 accent-indigo-500"
              />
              <label htmlFor="a_conf" className="text-xs text-slate-400 cursor-pointer select-none">
                A conferma
              </label>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => doAdd()}
                disabled={isAdding || importo <= 0}
                className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
              <button onClick={() => setAdding(false)} className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="px-3 py-2 border-t border-slate-800">
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Aggiungi acconto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sezione Degustazioni ───────────────────────────────────────────────────────

interface DegustazioniSectionProps {
  idEvento: number
  degustazioni: DegustazioneItem[]
  onDirty: () => void
  onAdded: (item: DegustazioneItem) => void
  onDeleted: (id: number) => void
}

const DegustazioniSection = ({ idEvento, degustazioni, onDirty, onAdded, onDeleted }: DegustazioniSectionProps) => {
  const [data, setData]     = useState('')
  const [nome, setNome]     = useState('')
  const [nPers, setNPers]   = useState(0)
  const [costo, setCosto]   = useState(0)
  const [detr, setDetr]     = useState(true)
  const [note, setNote]     = useState('')
  const [adding, setAdding] = useState(false)

  const { mutate: doAdd, isPending: isAdding } = useMutation({
    mutationFn: () => addDegustazione(idEvento, {
      data: data || null, nome: nome || null, n_persone: nPers,
      costo_degustazione: costo, detraibile: detr ? 1 : 0, note: note || null,
    }),
    onSuccess: (item) => {
      onAdded(item); onDirty()
      setData(''); setNome(''); setNPers(0); setCosto(0); setDetr(true); setNote(''); setAdding(false)
    },
    onError: () => toast.error('Errore aggiunta degustazione'),
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: (id: number) => deleteDegustazione(idEvento, id),
    onSuccess: (_d, id) => { onDeleted(id); onDirty() },
    onError: () => toast.error('Errore eliminazione degustazione'),
  })

  return (
    <div className="mx-5 mb-4 shrink-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Degustazioni</p>
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        {degustazioni.length === 0 && !adding ? (
          <p className="text-xs text-slate-600 px-4 py-3">Nessuna degustazione registrata</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="text-left px-3 py-2 text-xs text-slate-500 font-medium w-28">Data</th>
                <th className="text-left px-2 py-2 text-xs text-slate-500 font-medium">Nome</th>
                <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-16">Persone</th>
                <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-24">Costo</th>
                <th className="text-center px-2 py-2 text-xs text-slate-500 font-medium w-20">Detraibile</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {degustazioni.map((d) => (
                <tr key={d.id} className="border-b border-slate-800/50 last:border-0 group">
                  <td className="px-3 py-2 text-slate-400 text-xs">{d.data ?? '—'}</td>
                  <td className="px-2 py-2 text-slate-200">{d.nome ?? '—'}</td>
                  <td className="px-2 py-2 text-center text-slate-400 tabular-nums">{d.n_persone}</td>
                  <td className="px-2 py-2 text-center text-slate-300 tabular-nums">{fmtEuro(d.costo_degustazione)}</td>
                  <td className="px-2 py-2 text-center">
                    {d.detraibile ? (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Sì</span>
                    ) : (
                      <span className="text-xs text-slate-600">No</span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => doDelete(d.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {adding && (
          <div className="px-3 py-3 border-t border-slate-800 flex items-end gap-2 flex-wrap bg-slate-900/50">
            <div className="w-36">
              <p className="text-xs text-slate-500 mb-1">Data</p>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex-1 min-w-32">
              <p className="text-xs text-slate-500 mb-1">Nome cliente</p>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome…" autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="w-20">
              <p className="text-xs text-slate-500 mb-1">Persone</p>
              <input type="number" min={0} value={nPers} onChange={(e) => setNPers(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500 tabular-nums" />
            </div>
            <div className="w-24">
              <p className="text-xs text-slate-500 mb-1">Costo (€)</p>
              <input type="number" min={0} step={0.01} value={costo} onChange={(e) => setCosto(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500 tabular-nums" />
            </div>
            <div className="flex items-center gap-1.5 pb-0.5">
              <input type="checkbox" id="detr" checked={detr} onChange={(e) => setDetr(e.target.checked)}
                className="w-3.5 h-3.5 accent-indigo-500" />
              <label htmlFor="detr" className="text-xs text-slate-400 cursor-pointer select-none">Detraibile</label>
            </div>
            <div className="flex gap-1">
              <button onClick={() => doAdd()} disabled={isAdding}
                className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
              <button onClick={() => setAdding(false)} className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="px-3 py-2 border-t border-slate-800">
          {!adding && (
            <button onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Aggiungi degustazione
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pagina principale ──────────────────────────────────────────────────────────

export const SchedaEventoPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const idEvento = Number(id)
  const qc = useQueryClient()

  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Local state for optimistic updates
  const [localScheda, setLocalScheda] = useState<SchedaResponse | null>(null)

  const { data: evento } = useQuery({
    queryKey: queryKeys.eventi.detail(idEvento),
    queryFn: () => getEvento(idEvento),
    enabled: !isNaN(idEvento),
  })

  const { data: scheda, isLoading, isError } = useQuery({
    queryKey: queryKeys.scheda.byEvento(idEvento),
    queryFn: () => getScheda(idEvento),
    enabled: !isNaN(idEvento),
    staleTime: 0,
  })

  // Merge server data with local optimistic state
  const displayScheda = localScheda ?? scheda

  const markDirty = useCallback(() => setIsDirty(true), [])

  const handleOspiteUpdate = useCallback(
    (codTipo: string, partial: Partial<{ numero: number; costo: number; sconto: number; note: string | null }>) => {
      setLocalScheda((prev) => {
        const base = prev ?? scheda
        if (!base) return prev
        return {
          ...base,
          ospiti: base.ospiti.map((o) =>
            o.cod_tipo === codTipo ? { ...o, ...partial } : o
          ),
        }
      })
    },
    [scheda]
  )

  const handleExtraAdded = useCallback((item: { id: number; descrizione: string; costo: number; quantity: number; ordine: number }) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, extra: [...base.extra, item] }
    })
  }, [scheda])

  const handleExtraDeleted = useCallback((id: number) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, extra: base.extra.filter((e) => e.id !== id) }
    })
  }, [scheda])

  const handleAccontoAdded = useCallback((item: { id: number; acconto: number; data: string | null; a_conferma: number; descrizione: string | null; ordine: number }) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, acconti: [...base.acconti, item] }
    })
  }, [scheda])

  const handleAccontoDeleted = useCallback((id: number) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, acconti: base.acconti.filter((a) => a.id !== id) }
    })
  }, [scheda])

  const handleDegustazioneAdded = useCallback((item: DegustazioneItem) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, degustazioni: [...base.degustazioni, item] }
    })
  }, [scheda])

  const handleDegustazioneDeleted = useCallback((id: number) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, degustazioni: base.degustazioni.filter((d) => d.id !== id) }
    })
  }, [scheda])

  const handleScontoChange = useCallback((v: number) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, preventivo: { ...base.preventivo, sconto_totale: v } }
    })
  }, [scheda])

  const handleTotaleChange = useCallback((v: number | null) => {
    setLocalScheda((prev) => {
      const base = prev ?? scheda
      if (!base) return prev
      return { ...base, preventivo: { ...base.preventivo, totale_manuale: v, totale_netto: v ?? base.preventivo.totale_netto } }
    })
  }, [scheda])

  const handleSalva = async () => {
    setIsSaving(true)
    try {
      await salvaScheda(idEvento)
      setIsDirty(false)
      toast.success('Scheda salvata su database')
    } catch {
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRicarica = async () => {
    setIsSaving(true)
    try {
      const fresh = await ricaricaScheda(idEvento)
      qc.setQueryData(queryKeys.scheda.byEvento(idEvento), fresh)
      setLocalScheda(null)
      setIsDirty(false)
      toast.success('Scheda ricaricata dal database')
    } catch {
      toast.error('Errore nel ricaricamento')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 h-full text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Caricamento scheda…
      </div>
    )
  }

  if (isError || !displayScheda) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-red-400 text-sm">Errore nel caricamento della scheda</p>
        <button onClick={() => navigate(-1)} className="text-xs text-indigo-400 hover:text-indigo-300">
          ← Torna all'evento
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(`/gestionale/eventi/${idEvento}`)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-slate-100">Scheda evento</h1>
          {evento && (
            <p className="text-xs text-slate-500 mt-0.5">
              {evento.descrizione ?? evento.cliente ?? '(senza titolo)'}
              {evento.data && <> · {evento.data}</>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <span className="text-xs text-amber-400">modifiche non salvate</span>
          )}
          <button
            onClick={handleRicarica}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <RotateCcw className="w-3 h-3" />
            Annulla
          </button>
          <button
            onClick={handleSalva}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salva su DB
          </button>
        </div>
      </div>

      {/* Body scrollabile */}
      <div className="flex-1 overflow-y-auto py-3">
        {/* Preventivo */}
        <PreventivoCard
          prev={displayScheda.preventivo}
          idEvento={idEvento}
          onDirty={markDirty}
          onScontoChange={handleScontoChange}
          onTotaleChange={handleTotaleChange}
        />

        {/* Ospiti */}
        <OspitiSection
          idEvento={idEvento}
          ospiti={displayScheda.ospiti}
          onDirty={markDirty}
          onUpdate={handleOspiteUpdate}
        />

        {/* Degustazioni */}
        <DegustazioniSection
          idEvento={idEvento}
          degustazioni={displayScheda.degustazioni}
          onDirty={markDirty}
          onAdded={handleDegustazioneAdded}
          onDeleted={handleDegustazioneDeleted}
        />

        {/* Extra */}
        <ExtraSection
          idEvento={idEvento}
          extra={displayScheda.extra}
          onDirty={markDirty}
          onAdded={handleExtraAdded}
          onDeleted={handleExtraDeleted}
        />

        {/* Acconti */}
        <AccontiSection
          idEvento={idEvento}
          acconti={displayScheda.acconti}
          onDirty={markDirty}
          onAdded={handleAccontoAdded}
          onDeleted={handleAccontoDeleted}
        />
      </div>
    </div>
  )
}

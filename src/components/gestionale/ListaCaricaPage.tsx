import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, PackageX, Pencil, Trash2, X, Check,
  Plus, Users, Save, ChevronDown, AlertTriangle, RefreshCw, RotateCcw,
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getEvento, recalcolaLista, ricaricaLista, salvaLista, updateArticolo } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import { useListaCarico } from '@/hooks/useListaCarico'
import { useAddArticolo } from '@/hooks/useAddArticolo'
import { useDeleteArticolo } from '@/hooks/useDeleteArticolo'
import { useLookupArticoli } from '@/hooks/useLookupArticoli'
import { useLookupSezioni } from '@/hooks/useLookupSezioni'
import { usePatchEvento } from '@/hooks/usePatchEvento'
import { ArticoloCombobox } from './ArticoloCombobox'
import type { ListaCaricaItem, ArticoloLookupItem, UpdateListaItemBody } from '@/types/gestionale'
import toast from 'react-hot-toast'

// ── Costanti ───────────────────────────────────────────────────────────────────

const COD_ARTICOLO_GENERICO = 'gen-buf'

// ── Helpers ────────────────────────────────────────────────────────────────────

const cleanLabel = (s: string) => s.replace(/^\?+\s*/, '').replace(/^\^\^+\s*/, '').replace(/^\*+\s*/, '')

const QtaCell = ({ auto, manual }: { auto: number; manual: number }) => {
  const v = auto + manual
  if (v === 0) return <span className="text-slate-600">—</span>
  return (
    <span className="tabular-nums">
      <span className="text-slate-200">{auto}</span>
      {manual > 0 && <span className="text-indigo-400 text-xs ml-0.5">+{manual}</span>}
    </span>
  )
}

// ── Pannello parametri ospiti ──────────────────────────────────────────────────

const ParametriPanel = ({
  idEvento, totOspiti, percAper, hasItems, onDirty,
}: {
  idEvento: number
  totOspiti: number | null
  percAper: number | null
  hasItems: boolean
  onDirty: () => void
}) => {
  const [editing, setEditing] = useState(false)
  const [ospiti, setOspiti]   = useState(totOspiti ?? 0)
  const [perc, setPerc]       = useState(percAper ?? 0)
  const qc = useQueryClient()

  const { mutate: doRecalc, isPending: isRecalcing } = useMutation({
    mutationFn: () => recalcolaLista(idEvento),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.lista.byEvento(idEvento) })
      onDirty()
      toast.success(`Quantità ricalcolate (${data.recalculated} articoli)`)
    },
    onError: () => toast.error('Errore nel ricalcolo'),
  })

  const { mutate, isPending } = usePatchEvento(idEvento, () => {
    setEditing(false)
    if (hasItems) doRecalc()
  })

  const nApe   = percAper != null && totOspiti != null ? Math.round(totOspiti * percAper / 100) : null
  const nSedu  = nApe != null && totOspiti != null ? totOspiti - nApe : null
  const noOspiti = !totOspiti || totOspiti === 0

  if (!editing) {
    return (
      <div className="flex items-center gap-4 px-5 py-2 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400">
        <div
          className="flex items-center gap-4 flex-1 cursor-pointer hover:text-slate-300 transition-colors group"
          onClick={() => { setOspiti(totOspiti ?? 0); setPerc(percAper ?? 0); setEditing(true) }}
        >
          <Users className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span><span className="text-slate-200 font-medium">{totOspiti ?? '—'}</span> ospiti</span>
          {percAper != null && (
            <>
              <span className="text-slate-700">·</span>
              <span>
                <span className="text-slate-200 font-medium">{percAper}%</span> in piedi
                {nApe != null && nSedu != null && (
                  <span className="ml-1 text-slate-600">({nApe} ape · {nSedu} sedu)</span>
                )}
              </span>
            </>
          )}
          {noOspiti && (
            <span className="text-amber-500/80 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Imposta ospiti per calcolare le quantità
            </span>
          )}
          <Pencil className="ml-auto w-3 h-3 text-slate-600 group-hover:text-slate-400" />
        </div>
        {hasItems && !noOspiti && (
          <button
            onClick={() => doRecalc()}
            disabled={isRecalcing}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-400 transition-colors disabled:opacity-40"
            title="Ricalcola quantità in base agli ospiti"
          >
            {isRecalcing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Ricalcola
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-indigo-950/30 border-b border-indigo-900/40">
      <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500">Ospiti</span>
        <input type="number" min={0} step={1} value={ospiti}
          onChange={(e) => setOspiti(Number(e.target.value))}
          className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500">% in piedi</span>
        <input type="number" min={0} max={100} step={1} value={perc}
          onChange={(e) => setPerc(Number(e.target.value))}
          className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500"
        />
      </div>
      <button onClick={() => mutate({ perc_sedute_aper: perc })} disabled={isPending || isRecalcing}
        className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
        {isPending || isRecalcing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => setEditing(false)} disabled={isPending || isRecalcing}
        className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors disabled:opacity-50">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Edit inline ────────────────────────────────────────────────────────────────

interface EditRowProps {
  item: ListaCaricaItem
  idEvento: number
  onSaved: () => void
  onCancel: () => void
}

const EditRow = ({ item, idEvento, onSaved, onCancel }: EditRowProps) => {
  const isGenerico = item.cod_articolo === COD_ARTICOLO_GENERICO

  const [qta_ape,       setQtaApe]      = useState(item.qta_ape)
  const [qta_sedu,      setQtaSedu]     = useState(item.qta_sedu)
  const [qta_bufdol,    setQtaBuf]      = useState(item.qta_bufdol)
  const [qta_man_ape,   setManApe]      = useState(item.qta_man_ape)
  const [qta_man_sedu,  setManSedu]     = useState(item.qta_man_sedu)
  const [qta_man_bufdol,setManBuf]      = useState(item.qta_man_bufdol)
  const [note,          setNote]        = useState(item.note ?? '')
  const [colore,        setColore]      = useState(item.colore ?? '')
  const [dimensioni,    setDimensioni]  = useState(item.dimensioni ?? '')

  const { mutate: doUpdate, isPending } = useMutation({
    mutationFn: (body: UpdateListaItemBody) => updateArticolo(idEvento, item.id, body),
    onSuccess: () => onSaved(),
    onError: () => toast.error('Errore nel salvataggio della riga'),
  })

  const save = () => {
    doUpdate({
      qta_ape:        isGenerico ? undefined : qta_ape,
      qta_sedu:       isGenerico ? undefined : qta_sedu,
      qta_bufdol:     isGenerico ? undefined : qta_bufdol,
      qta_man_ape:    isGenerico ? 0 : qta_man_ape,
      qta_man_sedu:   isGenerico ? 0 : qta_man_sedu,
      qta_man_bufdol: isGenerico ? 0 : qta_man_bufdol,
      note:           note || null,
      colore:         colore || null,
      dimensioni:     dimensioni || null,
    })
  }

  const numInput = (val: number, set: (v: number) => void, lbl: string, accent = false) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xs ${accent ? 'text-indigo-400' : 'text-slate-500'}`}>{lbl}</span>
      <input
        type="number" min={0} step={1} value={val}
        onChange={(e) => set(Number(e.target.value))}
        className={`w-14 bg-slate-800 border rounded px-1 py-1 text-sm text-slate-100 text-center focus:outline-none ${
          accent ? 'border-indigo-700 focus:border-indigo-400' : 'border-slate-600 focus:border-indigo-500'
        }`}
      />
    </div>
  )

  const txtInput = (val: string, set: (v: string) => void, placeholder: string) => (
    <div className="flex flex-col gap-0.5 flex-1 min-w-24">
      <span className="text-xs text-slate-500">{placeholder}</span>
      <input
        type="text" value={val} onChange={(e) => set(e.target.value)}
        placeholder={`${placeholder}…`}
        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
      />
    </div>
  )

  return (
    <tr className="bg-indigo-950/30 border-b border-slate-700/50">
      <td className="px-4 py-3 text-sm">
        <p className="text-slate-300 font-medium">
          {isGenerico ? (note || 'Voce personalizzata') : (item.descrizione ?? item.cod_articolo)}
        </p>
        {!isGenerico && <p className="text-xs text-slate-500">{item.cod_articolo}</p>}
      </td>
      <td className="px-2 py-3" colSpan={4}>
        <div className="flex items-end gap-2 flex-wrap">
          {!isGenerico && (
            <>
              <div className="flex items-end gap-1">
                {numInput(qta_ape,       setQtaApe,  'Ape')}
                {numInput(qta_man_ape,   setManApe,  '+Ape',  true)}
              </div>
              <div className="flex items-end gap-1">
                {numInput(qta_sedu,      setQtaSedu, 'Sedu')}
                {numInput(qta_man_sedu,  setManSedu, '+Sedu', true)}
              </div>
              <div className="flex items-end gap-1">
                {numInput(qta_bufdol,    setQtaBuf,  'Buf')}
                {numInput(qta_man_bufdol,setManBuf,  '+Buf',  true)}
              </div>
              {txtInput(colore,     setColore,     'Colore')}
              {txtInput(dimensioni, setDimensioni, 'Dimensioni')}
            </>
          )}
          {txtInput(note, setNote, isGenerico ? 'Descrizione' : 'Note')}
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-1">
          <button onClick={save} disabled={isPending}
            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onCancel} disabled={isPending}
            className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors disabled:opacity-50">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Riga articolo ──────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ListaCaricaItem
  idEvento: number
  onEdit: () => void
}

const ItemRow = ({ item, idEvento, onEdit }: ItemRowProps) => {
  const [confirmDel, setConfirmDel] = useState(false)
  const { mutate: doDelete, isPending } = useDeleteArticolo(idEvento)
  const isGenerico = item.cod_articolo === COD_ARTICOLO_GENERICO

  return (
    <tr className="border-b border-slate-800/40 hover:bg-slate-900/30 group transition-colors">
      <td className="px-4 py-2.5 text-sm">
        <p className="text-slate-200 truncate max-w-xs">
          {isGenerico ? (item.note ?? 'Voce personalizzata') : (item.descrizione ?? item.cod_articolo)}
        </p>
        {!isGenerico && <p className="text-xs text-slate-600">{item.cod_articolo}</p>}
      </td>
      <td className="px-3 py-2.5 text-sm text-center w-20">
        {isGenerico ? <span className="text-slate-700">—</span> : <QtaCell auto={item.qta_ape} manual={item.qta_man_ape} />}
      </td>
      <td className="px-3 py-2.5 text-sm text-center w-20">
        {isGenerico ? <span className="text-slate-700">—</span> : <QtaCell auto={item.qta_sedu} manual={item.qta_man_sedu} />}
      </td>
      <td className="px-3 py-2.5 text-sm text-center w-20">
        {isGenerico ? <span className="text-slate-700">—</span> : <QtaCell auto={item.qta_bufdol} manual={item.qta_man_bufdol} />}
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[200px]">
        {isGenerico ? (
          <span className="text-slate-600 italic">voce libera</span>
        ) : (
          <div className="space-y-0.5">
            {item.note && <p className="truncate">{item.note}</p>}
            {item.colore && <p className="truncate text-slate-600"><span className="text-slate-700">Colore:</span> {item.colore}</p>}
            {item.dimensioni && <p className="truncate text-slate-600"><span className="text-slate-700">Dim:</span> {item.dimensioni}</p>}
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 w-20">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {confirmDel ? (
            <>
              <button onClick={() => doDelete(item.id)} disabled={isPending}
                className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded disabled:opacity-50">
                {isPending ? '…' : 'Sì'}
              </button>
              <button onClick={() => setConfirmDel(false)}
                className="text-xs text-slate-500 hover:text-slate-300">No</button>
            </>
          ) : (
            <>
              <button onClick={onEdit}
                className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={() => setConfirmDel(true)}
                className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Pannello aggiungi ──────────────────────────────────────────────────────────

interface AggiuntaPanelProps {
  idEvento: number
  addedCodes: Set<string>
  standardByCodTipo: Map<string, ArticoloLookupItem[]>
  sezioni: { cod_tipo: string; descrizione: string; cod_step: number }[]
  onAdded: () => void
}

interface AddConfirmProps {
  label: string
  codArticolo: string
  idEvento: number
  onConfirm: (body: { cod_articolo: string; qta_man_ape?: number; qta_man_sedu?: number; qta_man_bufdol?: number; note?: string }) => void
  onCancel: () => void
  isPending: boolean
}

const AddConfirmForm = ({ label, codArticolo, onConfirm, onCancel, isPending }: AddConfirmProps) => {
  const isGenerico = codArticolo === COD_ARTICOLO_GENERICO
  const [manApe,  setManApe]  = useState(0)
  const [manSedu, setManSedu] = useState(0)
  const [manBuf,  setManBuf]  = useState(0)
  const [nota,    setNota]    = useState('')

  const submit = () => {
    if (isGenerico && !nota.trim()) return
    onConfirm({
      cod_articolo:   codArticolo,
      qta_man_ape:    manApe  > 0 ? manApe  : undefined,
      qta_man_sedu:   manSedu > 0 ? manSedu : undefined,
      qta_man_bufdol: manBuf  > 0 ? manBuf  : undefined,
      note:           nota.trim() || undefined,
    })
  }

  const numInput = (val: number, set: (v: number) => void, lbl: string) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-slate-500">{lbl}</span>
      <input type="number" min={0} step={1} value={val}
        onChange={(e) => set(Number(e.target.value))}
        className="w-14 bg-slate-800 border border-slate-600 rounded px-1 py-1 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500"
      />
    </div>
  )

  return (
    <div className="mt-2 p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
      <p className="text-xs font-medium text-slate-300 mb-2 truncate">{label}</p>
      <div className="flex items-end gap-2 flex-wrap">
        {!isGenerico && (
          <div>
            <p className="text-xs text-slate-600 mb-1">Quantità manuale (0 = automatica)</p>
            <div className="flex gap-1">
              {numInput(manApe,  setManApe,  'Ape')}
              {numInput(manSedu, setManSedu, 'Sedu')}
              {numInput(manBuf,  setManBuf,  'Buf')}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-0.5 flex-1 min-w-32">
          <span className="text-xs text-slate-500">{isGenerico ? 'Descrizione *' : 'Note'}</span>
          <input
            type="text" value={nota} onChange={(e) => setNota(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel() }}
            placeholder={isGenerico ? 'Descrivi la richiesta…' : 'Note opzionali…'}
            autoFocus
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1">
          <button onClick={submit} disabled={isPending || (isGenerico && !nota.trim())}
            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
          <button onClick={onCancel}
            className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

const AggiuntaPanel = ({ idEvento, addedCodes, standardByCodTipo, sezioni, onAdded }: AggiuntaPanelProps) => {
  const [open, setOpen]               = useState(false)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [pending, setPending]         = useState<{ cod: string; label: string } | null>(null)
  const [catFilter, setCatFilter]     = useState('')
  const { mutate: doAdd, isPending }  = useAddArticolo(idEvento)

  const addArticolo = useCallback((cod: string, label: string) => {
    setPending({ cod, label })
  }, [])

  const confirmAdd = (body: Parameters<typeof doAdd>[0]) => {
    doAdd(body, {
      onSuccess: () => {
        setPending(null)
        setSearchValue(null)
        onAdded()
      },
    })
  }

  const selectedSezione = sezioni.find((s) => s.cod_tipo === selectedCat)
  const standardItems   = selectedCat ? (standardByCodTipo.get(selectedCat) ?? []) : []

  return (
    <div className="border-b border-slate-800 bg-slate-950 shrink-0">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) { setSelectedCat(null); setPending(null) } }}
        className="w-full flex items-center gap-2 px-5 py-3 hover:bg-slate-900/50 transition-colors text-left"
      >
        <Plus className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="text-sm font-medium text-slate-300">Aggiungi articolo</span>
        <ChevronDown className={`ml-auto w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          {!selectedCat ? (
            <>
              <p className="text-xs text-slate-500">Seleziona una categoria</p>
              <input
                type="text"
                placeholder="Filtra categoria…"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {sezioni
                  .filter((s) => !catFilter || cleanLabel(s.descrizione).toLowerCase().includes(catFilter.toLowerCase()))
                  .map((s) => (
                    <button key={s.cod_tipo}
                      onClick={() => { setSelectedCat(s.cod_tipo); setPending(null); setCatFilter('') }}
                      className="px-3 py-1.5 rounded-full text-xs border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                    >
                      {cleanLabel(s.descrizione)}
                    </button>
                  ))}
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                {pending?.cod === COD_ARTICOLO_GENERICO ? (
                  <AddConfirmForm
                    label="Voce personalizzata"
                    codArticolo={COD_ARTICOLO_GENERICO}
                    idEvento={idEvento}
                    onConfirm={confirmAdd}
                    onCancel={() => setPending(null)}
                    isPending={isPending}
                  />
                ) : (
                  <button onClick={() => setPending({ cod: COD_ARTICOLO_GENERICO, label: 'Voce personalizzata' })}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Aggiungi voce personalizzata
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setSelectedCat(null); setSearchValue(null); setPending(null) }}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                {cleanLabel(selectedSezione?.descrizione ?? selectedCat)}
              </button>

              {standardItems.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 mb-1.5">Suggeriti</p>
                  <div className="flex flex-wrap gap-1.5">
                    {standardItems.map((a) => {
                      const added = addedCodes.has(a.cod_articolo)
                      const lbl = a.descrizione ? cleanLabel(a.descrizione.length > 32 ? a.descrizione.slice(0, 32) + '…' : a.descrizione) : a.cod_articolo
                      return (
                        <button key={a.cod_articolo}
                          onClick={() => !added && addArticolo(a.cod_articolo, a.descrizione ?? a.cod_articolo)}
                          disabled={added}
                          className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                            added
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-indigo-300'
                          }`}
                        >
                          {added ? '✓ ' : '+ '}{lbl}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {pending && pending.cod !== COD_ARTICOLO_GENERICO && (
                <AddConfirmForm
                  label={pending.label}
                  codArticolo={pending.cod}
                  idEvento={idEvento}
                  onConfirm={confirmAdd}
                  onCancel={() => setPending(null)}
                  isPending={isPending}
                />
              )}

              {!pending && (
                <ArticoloCombobox
                  value={searchValue}
                  onChange={(cod, art) => {
                    if (cod && art) {
                      setSearchValue(null)
                      addArticolo(cod, art.descrizione ?? cod)
                    }
                  }}
                  codTipo={selectedCat}
                  placeholder={`Cerca in ${cleanLabel(selectedSezione?.descrizione ?? selectedCat)}…`}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Pagina principale ──────────────────────────────────────────────────────────

export const ListaCaricaPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const idEvento = Number(id)
  const qc = useQueryClient()

  // Traccia se ci sono modifiche non ancora salvate su BQ
  const [isDirty, setIsDirty] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving,  setIsSaving]  = useState(false)

  const { data: evento } = useQuery({
    queryKey: queryKeys.eventi.detail(idEvento),
    queryFn:  () => getEvento(idEvento),
    enabled:  !isNaN(idEvento),
  })

  const { data: lista = [], isLoading, isError } = useListaCarico(idEvento)
  const { data: sezioni = [] }  = useLookupSezioni()
  const { data: articoli = [] } = useLookupArticoli()

  const addedCodes = useMemo(() => new Set(lista.map((i) => i.cod_articolo)), [lista])

  const standardByCodTipo = useMemo(() => {
    const map = new Map<string, ArticoloLookupItem[]>()
    for (const a of articoli) {
      if (a.cod_tipo && a.rank != null && a.descrizione) {
        if (!map.has(a.cod_tipo)) map.set(a.cod_tipo, [])
        map.get(a.cod_tipo)!.push(a)
      }
    }
    for (const [k, v] of map.entries()) {
      map.set(k, v.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)).slice(0, 6))
    }
    return map
  }, [articoli])

  // Raggruppa items per categoria, ordinati per cod_step
  const groupedRows = useMemo(() => {
    const groups = new Map<string, { label: string; step: number; items: ListaCaricaItem[] }>()
    for (const item of lista) {
      const key = item.cod_tipo ?? '__none__'
      if (!groups.has(key)) {
        groups.set(key, {
          label: cleanLabel(item.tipo_descrizione ?? item.cod_tipo ?? 'Altro'),
          step:  item.cod_step ?? 999,
          items: [],
        })
      }
      groups.get(key)!.items.push(item)
    }
    return [...groups.values()].sort((a, b) => a.step - b.step)
  }, [lista])

  // Salva su BQ
  const handleSalva = async () => {
    setIsSaving(true)
    try {
      const res = await salvaLista(idEvento)
      setIsDirty(false)
      toast.success(`Salvato (${res.saved} articoli)`)
    } catch {
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsSaving(false)
    }
  }

  // Scarta modifiche: ricarica dal BQ
  const handleRicarica = async () => {
    setIsSaving(true)
    try {
      const items = await ricaricaLista(idEvento)
      qc.setQueryData(queryKeys.lista.byEvento(idEvento), items)
      setIsDirty(false)
      setEditingId(null)
      toast.success('Lista ricaricata dal database')
    } catch {
      toast.error('Errore nel ricaricamento')
    } finally {
      setIsSaving(false)
    }
  }

  const markDirty = useCallback(() => setIsDirty(true), [])

  const notConfirmed = evento && evento.stato !== 'confermato'

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate(`/gestionale/eventi/${idEvento}`)}
          className="text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-slate-100">Lista di carico</h1>
          {evento && (
            <p className="text-xs text-slate-500 mt-0.5">
              {evento.descrizione ?? evento.cliente ?? '(senza titolo)'}
              {evento.data && <> · {evento.data}</>}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isLoading && lista.length > 0 && !isDirty && (
            <span className="text-xs text-slate-500 tabular-nums">
              {lista.length} articol{lista.length !== 1 ? 'i' : 'o'}
            </span>
          )}
          {isDirty && (
            <span className="text-xs text-amber-400">modifiche non salvate</span>
          )}
          {!notConfirmed && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Avviso evento non confermato */}
      {notConfirmed && (
        <div className="flex items-center gap-2 px-5 py-3 bg-amber-950/30 border-b border-amber-900/40 text-xs text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Questo evento non è confermato — la lista di carico è in sola lettura.
        </div>
      )}

      {/* Parametri ospiti */}
      {evento && !notConfirmed && (
        <ParametriPanel
          idEvento={idEvento}
          totOspiti={evento.tot_ospiti}
          percAper={evento.perc_sedute_aper}
          hasItems={lista.length > 0}
          onDirty={markDirty}
        />
      )}

      {/* Pannello aggiungi — sopra la tabella */}
      {!isLoading && !isError && !notConfirmed && (
        <AggiuntaPanel
          idEvento={idEvento}
          addedCodes={addedCodes}
          standardByCodTipo={standardByCodTipo}
          sezioni={sezioni}
          onAdded={() => { qc.invalidateQueries({ queryKey: queryKeys.lista.byEvento(idEvento) }); markDirty() }}
        />
      )}

      {/* Corpo scrollabile */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Caricamento…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-400 text-sm">
            Errore nel caricamento della lista di carico.
          </div>
        ) : lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-500">
            <PackageX className="w-8 h-8 text-slate-700" />
            <p className="text-sm">Nessun articolo in lista</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider">Articolo</th>
                <th className="text-center px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider w-20">Ape</th>
                <th className="text-center px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider w-20">Sedu</th>
                <th className="text-center px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider w-20">Buf</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider">Dettagli</th>
                <th className="w-20 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {groupedRows.map(({ label, items }) => (
                <>
                  <tr key={`hdr-${label}`} className="bg-slate-900/70 border-y border-slate-800/60">
                    <td colSpan={6} className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      {label}
                    </td>
                  </tr>
                  {items.map((item) =>
                    editingId === item.id ? (
                      <EditRow
                        key={item.id}
                        item={item}
                        idEvento={idEvento}
                        onSaved={() => {
                          qc.invalidateQueries({ queryKey: queryKeys.lista.byEvento(idEvento) })
                          setEditingId(null)
                          markDirty()
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <ItemRow
                        key={item.id}
                        item={item}
                        idEvento={idEvento}
                        onEdit={() => { if (!notConfirmed) setEditingId(item.id) }}
                      />
                    )
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

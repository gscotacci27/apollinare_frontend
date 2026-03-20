import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, PackageX, Pencil, Trash2, X, Check,
  Plus, Users, Save, ChevronDown, AlertTriangle,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getEvento, updateArticolo } from '@/services/gestionale'
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

// Tipo per le modifiche in bozza (tutte opzionali)
type DraftChanges = Partial<UpdateListaItemBody>

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
  idEvento, totOspiti, percAper,
}: { idEvento: number; totOspiti: number | null; percAper: number | null }) => {
  const [editing, setEditing] = useState(false)
  const [ospiti, setOspiti]   = useState(totOspiti ?? 0)
  const [perc, setPerc]       = useState(percAper ?? 0)
  const { mutate, isPending } = usePatchEvento(idEvento, () => setEditing(false))

  const nApe  = percAper != null && totOspiti != null ? Math.round(totOspiti * percAper / 100) : null
  const nSedu = nApe != null && totOspiti != null ? totOspiti - nApe : null

  if (!editing) {
    return (
      <div
        className="flex items-center gap-4 px-5 py-2 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400 cursor-pointer hover:bg-slate-900 transition-colors group"
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
        <Pencil className="ml-auto w-3 h-3 text-slate-600 group-hover:text-slate-400" />
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
      <button onClick={() => mutate({ tot_ospiti: ospiti, perc_sedute_aper: perc })} disabled={isPending}
        className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => setEditing(false)}
        className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Edit inline (draft) ────────────────────────────────────────────────────────

interface EditRowProps {
  item: ListaCaricaItem
  draft: DraftChanges
  onDraftChange: (changes: DraftChanges) => void
  onClose: () => void
}

const EditRow = ({ item, draft, onDraftChange, onClose }: EditRowProps) => {
  const isGenerico = item.cod_articolo === COD_ARTICOLO_GENERICO

  // Valori correnti = draft se presente, altrimenti item originale
  const v = (key: keyof DraftChanges) =>
    key in draft ? draft[key] : (item as unknown as Record<string, unknown>)[key]

  const set = (key: keyof DraftChanges, val: unknown) =>
    onDraftChange({ ...draft, [key]: val })

  const numInput = (key: keyof UpdateListaItemBody, lbl: string, accent = false) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xs ${accent ? 'text-indigo-400' : 'text-slate-500'}`}>{lbl}</span>
      <input
        type="number" min={0} step={1}
        value={(v(key) as number) ?? 0}
        onChange={(e) => set(key, Number(e.target.value))}
        className={`w-14 bg-slate-800 border rounded px-1 py-1 text-sm text-slate-100 text-center focus:outline-none ${
          accent ? 'border-indigo-700 focus:border-indigo-400' : 'border-slate-600 focus:border-indigo-500'
        }`}
      />
    </div>
  )

  const txtInput = (key: keyof UpdateListaItemBody, placeholder: string) => (
    <div className="flex flex-col gap-0.5 flex-1 min-w-24">
      <span className="text-xs text-slate-500">{placeholder}</span>
      <input
        type="text"
        value={(v(key) as string) ?? ''}
        onChange={(e) => set(key, e.target.value || null)}
        placeholder={`${placeholder}…`}
        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
      />
    </div>
  )

  return (
    <tr className="bg-indigo-950/30 border-b border-slate-700/50">
      <td className="px-4 py-3 text-sm">
        <p className="text-slate-300 font-medium">
          {isGenerico ? ((v('note') as string) ?? item.note ?? 'Voce personalizzata') : (item.descrizione ?? item.cod_articolo)}
        </p>
        {!isGenerico && <p className="text-xs text-slate-500">{item.cod_articolo}</p>}
      </td>
      <td className="px-2 py-3" colSpan={4}>
        <div className="flex items-end gap-2 flex-wrap">
          {!isGenerico && (
            <>
              <div className="flex items-end gap-1">
                {numInput('qta_ape',   'Ape')}
                {numInput('qta_man_ape',  '+Ape',  true)}
              </div>
              <div className="flex items-end gap-1">
                {numInput('qta_sedu',  'Sedu')}
                {numInput('qta_man_sedu', '+Sedu', true)}
              </div>
              <div className="flex items-end gap-1">
                {numInput('qta_bufdol','Buf')}
                {numInput('qta_man_bufdol','+Buf', true)}
              </div>
              {txtInput('colore',     'Colore')}
              {txtInput('dimensioni', 'Dimensioni')}
            </>
          )}
          {txtInput('note', isGenerico ? 'Descrizione' : 'Note')}
        </div>
      </td>
      <td className="px-3 py-3">
        <button onClick={onClose}
          className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}

// ── Riga articolo ──────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ListaCaricaItem
  draft: DraftChanges | undefined
  idEvento: number
  onEdit: () => void
}

const ItemRow = ({ item, draft, idEvento, onEdit }: ItemRowProps) => {
  const [confirmDel, setConfirmDel] = useState(false)
  const { mutate: doDelete, isPending } = useDeleteArticolo(idEvento)

  const isGenerico = item.cod_articolo === COD_ARTICOLO_GENERICO
  const hasDraft = draft !== undefined && Object.keys(draft).length > 0

  // Valori da mostrare: draft ha la precedenza sull'originale
  const apeAuto  = (draft?.qta_ape   ?? item.qta_ape)
  const seduAuto = (draft?.qta_sedu  ?? item.qta_sedu)
  const bufAuto  = (draft?.qta_bufdol ?? item.qta_bufdol)
  const apeMon   = (draft?.qta_man_ape   ?? item.qta_man_ape)
  const seduMan  = (draft?.qta_man_sedu  ?? item.qta_man_sedu)
  const bufMan   = (draft?.qta_man_bufdol ?? item.qta_man_bufdol)
  const nota     = 'note' in (draft ?? {}) ? draft!.note : item.note
  const label    = isGenerico
    ? (('note' in (draft ?? {})) ? (draft!.note ?? 'Voce personalizzata') : (item.note ?? 'Voce personalizzata'))
    : (item.descrizione ?? item.cod_articolo)

  return (
    <tr className={`border-b border-slate-800/40 hover:bg-slate-900/30 group transition-colors ${hasDraft ? 'bg-amber-950/10' : ''}`}>
      <td className="px-4 py-2.5 text-sm">
        <div className="flex items-center gap-1.5">
          {hasDraft && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Modifiche non salvate" />}
          <div>
            <p className="text-slate-200 truncate max-w-xs">{label}</p>
            {!isGenerico && <p className="text-xs text-slate-600">{item.cod_articolo}</p>}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm text-center w-20">
        {isGenerico ? <span className="text-slate-700">—</span> : <QtaCell auto={apeAuto} manual={apeMon} />}
      </td>
      <td className="px-3 py-2.5 text-sm text-center w-20">
        {isGenerico ? <span className="text-slate-700">—</span> : <QtaCell auto={seduAuto} manual={seduMan} />}
      </td>
      <td className="px-3 py-2.5 text-sm text-center w-20">
        {isGenerico ? <span className="text-slate-700">—</span> : <QtaCell auto={bufAuto} manual={bufMan} />}
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[200px]">
        {isGenerico ? (
          <span className="text-slate-600 italic">voce libera</span>
        ) : (
          <div className="space-y-0.5">
            {nota && <p className="truncate">{nota}</p>}
            {(draft?.colore ?? item.colore) && (
              <p className="truncate text-slate-600">
                <span className="text-slate-700">Colore:</span> {draft?.colore ?? item.colore}
              </p>
            )}
            {(draft?.dimensioni ?? item.dimensioni) && (
              <p className="truncate text-slate-600">
                <span className="text-slate-700">Dim:</span> {draft?.dimensioni ?? item.dimensioni}
              </p>
            )}
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
}

// Form conferma aggiunta (quantità + note)
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
      cod_articolo: codArticolo,
      qta_man_ape:    manApe  > 0 ? manApe  : undefined,
      qta_man_sedu:   manSedu > 0 ? manSedu : undefined,
      qta_man_bufdol: manBuf  > 0 ? manBuf  : undefined,
      note: nota.trim() || undefined,
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
          <>
            <div>
              <p className="text-xs text-slate-600 mb-1">Quantità (0 = automatica)</p>
              <div className="flex gap-1">
                {numInput(manApe,  setManApe,  'Ape')}
                {numInput(manSedu, setManSedu, 'Sedu')}
                {numInput(manBuf,  setManBuf,  'Buf')}
              </div>
            </div>
          </>
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

const AggiuntaPanel = ({ idEvento, addedCodes, standardByCodTipo, sezioni }: AggiuntaPanelProps) => {
  const [open, setOpen]               = useState(false)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState<string | null>(null)
  const [pending, setPending]         = useState<{ cod: string; label: string } | null>(null)
  const { mutate: doAdd, isPending }  = useAddArticolo(idEvento)

  const addArticolo = useCallback((cod: string, label: string) => {
    setPending({ cod, label })
  }, [])

  const confirmAdd = (body: Parameters<typeof doAdd>[0]) => {
    doAdd(body, {
      onSuccess: () => {
        setPending(null)
        setSearchValue(null)
      },
    })
  }

  const selectedSezione = sezioni.find((s) => s.cod_tipo === selectedCat)
  const standardItems = selectedCat ? (standardByCodTipo.get(selectedCat) ?? []) : []

  return (
    <div className="border-t border-slate-800 bg-slate-950">
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
              <div className="flex flex-wrap gap-1.5">
                {sezioni.map((s) => (
                  <button key={s.cod_tipo}
                    onClick={() => { setSelectedCat(s.cod_tipo); setPending(null) }}
                    className="px-3 py-1.5 rounded-full text-xs border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                  >
                    {cleanLabel(s.descrizione)}
                  </button>
                ))}
              </div>
              {/* Voce personalizzata */}
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
              {/* Header categoria */}
              <button
                onClick={() => { setSelectedCat(null); setSearchValue(null); setPending(null) }}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                {cleanLabel(selectedSezione?.descrizione ?? selectedCat)}
              </button>

              {/* Chip suggeriti */}
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

              {/* Form conferma aggiunta (chip selezionata) */}
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

              {/* Combobox */}
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
  const queryClient = useQueryClient()

  // Draft: mappa itemId → modifiche pendenti
  const [draft, setDraft] = useState<Map<number, DraftChanges>>(new Map())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const hasDraft = draft.size > 0

  const { data: evento } = useQuery({
    queryKey: queryKeys.eventi.detail(idEvento),
    queryFn: () => getEvento(idEvento),
    enabled: !isNaN(idEvento),
  })

  const { data: lista = [], isLoading, isError } = useListaCarico(idEvento)
  const { data: sezioni = [] } = useLookupSezioni()
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

  // Aggiorna le modifiche di un item nel draft
  const updateDraft = useCallback((itemId: number, changes: DraftChanges) => {
    setDraft((prev) => {
      const next = new Map(prev)
      next.set(itemId, { ...(prev.get(itemId) ?? {}), ...changes })
      return next
    })
  }, [])

  // Salva tutto il draft su BigQuery
  const saveDraft = async () => {
    if (!hasDraft) return
    setIsSaving(true)
    try {
      await Promise.all(
        Array.from(draft.entries()).map(([itemId, changes]) => {
          const item = lista.find((i) => i.id === itemId)
          if (!item) return Promise.resolve()
          const body: UpdateListaItemBody = {
            qta_ape:        'qta_ape'    in changes ? changes.qta_ape    : undefined,
            qta_sedu:       'qta_sedu'   in changes ? changes.qta_sedu   : undefined,
            qta_bufdol:     'qta_bufdol' in changes ? changes.qta_bufdol : undefined,
            qta_man_ape:    changes.qta_man_ape    ?? item.qta_man_ape,
            qta_man_sedu:   changes.qta_man_sedu   ?? item.qta_man_sedu,
            qta_man_bufdol: changes.qta_man_bufdol ?? item.qta_man_bufdol,
            note:        'note'       in changes ? changes.note       ?? null : item.note,
            colore:      'colore'     in changes ? changes.colore     ?? null : item.colore,
            dimensioni:  'dimensioni' in changes ? changes.dimensioni ?? null : item.dimensioni,
          }
          return updateArticolo(idEvento, itemId, body)
        })
      )
      setDraft(new Map())
      setEditingId(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.lista.byEvento(idEvento) })
      toast.success('Lista salvata')
    } catch {
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsSaving(false)
    }
  }

  const discardDraft = () => {
    setDraft(new Map())
    setEditingId(null)
  }

  // Guard: evento non confermato
  const notConfirmed = evento && evento.stato !== 400

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

        {/* Contatore + pulsanti draft */}
        <div className="flex items-center gap-2 shrink-0">
          {!isLoading && lista.length > 0 && !hasDraft && (
            <span className="text-xs text-slate-500 tabular-nums">
              {lista.length} articol{lista.length !== 1 ? 'i' : 'o'}
            </span>
          )}
          {hasDraft && (
            <>
              <span className="text-xs text-amber-400 tabular-nums">
                {draft.size} modific{draft.size !== 1 ? 'he' : 'a'}
              </span>
              <button onClick={discardDraft}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-md transition-colors">
                Annulla
              </button>
              <button onClick={saveDraft} disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Salva
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
        />
      )}

      {/* Corpo scrollabile */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Caricamento…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-400 text-sm">
            Errore nel caricamento della lista di carico.
          </div>
        ) : (
          <>
            {lista.length > 0 ? (
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
                  {lista.map((item) =>
                    editingId === item.id ? (
                      <EditRow
                        key={item.id}
                        item={item}
                        draft={draft.get(item.id) ?? {}}
                        onDraftChange={(changes) => updateDraft(item.id, changes)}
                        onClose={() => setEditingId(null)}
                      />
                    ) : (
                      <ItemRow
                        key={item.id}
                        item={item}
                        draft={draft.get(item.id)}
                        idEvento={idEvento}
                        onEdit={() => {
                          if (notConfirmed) return
                          setEditingId(item.id)
                        }}
                      />
                    )
                  )}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-500">
                <PackageX className="w-8 h-8 text-slate-700" />
                <p className="text-sm">Nessun articolo in lista</p>
              </div>
            )}
            <div className="flex-1" />
          </>
        )}

        {!isLoading && !isError && !notConfirmed && (
          <AggiuntaPanel
            idEvento={idEvento}
            addedCodes={addedCodes}
            standardByCodTipo={standardByCodTipo}
            sezioni={sezioni}
          />
        )}
      </div>
    </div>
  )
}

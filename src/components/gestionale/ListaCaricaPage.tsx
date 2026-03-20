import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, PackageX, Pencil, Trash2, X, Check,
  Plus, Users, Save, ChevronDown,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getEvento } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import { useListaCarico } from '@/hooks/useListaCarico'
import { useAddArticolo } from '@/hooks/useAddArticolo'
import { useUpdateArticolo } from '@/hooks/useUpdateArticolo'
import { useDeleteArticolo } from '@/hooks/useDeleteArticolo'
import { useLookupArticoli } from '@/hooks/useLookupArticoli'
import { useLookupSezioni } from '@/hooks/useLookupSezioni'
import { usePatchEvento } from '@/hooks/usePatchEvento'
import { ArticoloCombobox } from './ArticoloCombobox'
import type { ListaCaricaItem, ArticoloLookupItem, UpdateListaItemBody } from '@/types/gestionale'

// ── Helpers ────────────────────────────────────────────────────────────────────

const COD_ARTICOLO_GENERICO = 'gen-buf'

const cleanLabel = (s: string) => s.replace(/^\?+\s*/, '').replace(/^\^\^+\s*/, '')

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
      <button onClick={() => mutate({ tot_ospiti: ospiti, perc_sedute_aper: perc })}
        disabled={isPending}
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

// ── Edit inline ────────────────────────────────────────────────────────────────

const EditRow = ({
  item, idEvento, onCancel,
}: { item: ListaCaricaItem; idEvento: number; onCancel: () => void }) => {
  const [baseApe,  setBaseApe]  = useState(item.qta_ape)
  const [baseSedu, setBaseSedu] = useState(item.qta_sedu)
  const [baseBuf,  setBaseBuf]  = useState(item.qta_bufdol)
  const [manApe,   setManApe]   = useState(item.qta_man_ape)
  const [manSedu,  setManSedu]  = useState(item.qta_man_sedu)
  const [manBuf,   setManBuf]   = useState(item.qta_man_bufdol)
  const [note, setNote]         = useState(item.note ?? '')
  const { mutate, isPending }   = useUpdateArticolo(idEvento, onCancel)

  const isGenerico = item.cod_articolo === COD_ARTICOLO_GENERICO

  const save = () => mutate({
    itemId: item.id,
    body: {
      qta_ape:        baseApe  !== item.qta_ape    ? baseApe  : undefined,
      qta_sedu:       baseSedu !== item.qta_sedu   ? baseSedu : undefined,
      qta_bufdol:     baseBuf  !== item.qta_bufdol ? baseBuf  : undefined,
      qta_man_ape:    manApe,
      qta_man_sedu:   manSedu,
      qta_man_bufdol: manBuf,
      note: note.trim() || null,
    } satisfies UpdateListaItemBody,
  })

  const numInput = (val: number, set: (v: number) => void, lbl: string, accent = false) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xs ${accent ? 'text-indigo-400' : 'text-slate-500'}`}>{lbl}</span>
      <input type="number" min={0} step={1} value={val}
        onChange={(e) => set(Number(e.target.value))}
        className={`w-14 bg-slate-800 border rounded px-1 py-1 text-sm text-slate-100 text-center focus:outline-none ${
          accent ? 'border-indigo-700 focus:border-indigo-400' : 'border-slate-600 focus:border-indigo-500'
        }`}
      />
    </div>
  )

  return (
    <tr className="bg-indigo-950/30 border-b border-slate-700/50">
      <td className="px-4 py-2.5 text-sm">
        <p className="text-slate-300 font-medium">
          {isGenerico ? (item.note ?? 'Voce personalizzata') : (item.descrizione ?? item.cod_articolo)}
        </p>
        {!isGenerico && <p className="text-xs text-slate-500">{item.cod_articolo}</p>}
      </td>
      <td className="px-2 py-2.5" colSpan={3}>
        <div className="flex items-end gap-2 flex-wrap">
          {!isGenerico && (
            <>
              <div className="flex items-end gap-1">
                {numInput(baseApe,  setBaseApe,  'Ape')}
                {numInput(manApe,   setManApe,   '+Ape', true)}
              </div>
              <div className="flex items-end gap-1">
                {numInput(baseSedu, setBaseSedu, 'Sedu')}
                {numInput(manSedu,  setManSedu,  '+Sedu', true)}
              </div>
              <div className="flex items-end gap-1">
                {numInput(baseBuf,  setBaseBuf,  'Buf')}
                {numInput(manBuf,   setManBuf,   '+Buf', true)}
              </div>
            </>
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-32">
            <span className="text-xs text-slate-500">Note</span>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder={isGenerico ? 'Descrivi la richiesta…' : 'Note…'}
              autoFocus={isGenerico}
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button onClick={save} disabled={isPending}
            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onCancel}
            className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Riga articolo ──────────────────────────────────────────────────────────────

const ItemRow = ({
  item, idEvento, onEdit,
}: { item: ListaCaricaItem; idEvento: number; onEdit: () => void }) => {
  const [confirmDel, setConfirmDel] = useState(false)
  const { mutate: doDelete, isPending } = useDeleteArticolo(idEvento)

  const isGenerico = item.cod_articolo === COD_ARTICOLO_GENERICO
  const label = isGenerico
    ? (item.note ?? 'Voce personalizzata')
    : (item.descrizione ?? item.cod_articolo)

  return (
    <tr className="border-b border-slate-800/40 hover:bg-slate-900/30 group transition-colors">
      <td className="px-4 py-2.5 text-sm">
        <p className="text-slate-200 truncate max-w-xs">{label}</p>
        {!isGenerico && <p className="text-xs text-slate-600">{item.cod_articolo}</p>}
        {item.tipo_descrizione && (
          <p className="text-xs text-slate-700">{cleanLabel(item.tipo_descrizione)}</p>
        )}
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
      <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[140px]">
        {isGenerico
          ? <span className="text-slate-600 italic">voce libera</span>
          : <span className="truncate block">{item.note ?? ''}</span>}
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

const AggiuntaPanel = ({ idEvento, addedCodes, standardByCodTipo, sezioni }: AggiuntaPanelProps) => {
  const [open, setOpen]                   = useState(false)
  const [selectedCat, setSelectedCat]     = useState<string | null>(null)
  const [searchValue, setSearchValue]     = useState<string | null>(null)
  const [notaLibera, setNotaLibera]       = useState('')
  const [showNotaForm, setShowNotaForm]   = useState(false)
  const { mutate: doAdd, isPending }      = useAddArticolo(idEvento)

  const addArticolo = (cod: string, note?: string) => {
    doAdd({ cod_articolo: cod, note })
  }

  const addVoceLibera = () => {
    if (!notaLibera.trim()) return
    doAdd(
      { cod_articolo: COD_ARTICOLO_GENERICO, note: notaLibera.trim() },
      { onSuccess: () => { setNotaLibera(''); setShowNotaForm(false) } },
    )
  }

  const standardItems = selectedCat ? (standardByCodTipo.get(selectedCat) ?? []) : []
  const selectedSezione = sezioni.find((s) => s.cod_tipo === selectedCat)

  return (
    <div className="border-t border-slate-800 bg-slate-950">
      {/* Toggle header */}
      <button
        onClick={() => { setOpen((v) => !v); if (!open) setSelectedCat(null) }}
        className="w-full flex items-center gap-2 px-5 py-3 hover:bg-slate-900/50 transition-colors text-left"
      >
        <Plus className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="text-sm font-medium text-slate-300">Aggiungi articolo</span>
        <ChevronDown className={`ml-auto w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">

          {/* Selezione categoria */}
          {!selectedCat ? (
            <div>
              <p className="text-xs text-slate-500 mb-2.5">Seleziona una categoria</p>
              <div className="flex flex-wrap gap-1.5">
                {sezioni.map((s) => (
                  <button
                    key={s.cod_tipo}
                    onClick={() => setSelectedCat(s.cod_tipo)}
                    className="px-3 py-1.5 rounded-full text-xs border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                  >
                    {cleanLabel(s.descrizione)}
                  </button>
                ))}
              </div>

              {/* Voce libera */}
              <div className="mt-3 pt-3 border-t border-slate-800/60">
                {showNotaForm ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text" value={notaLibera}
                      onChange={(e) => setNotaLibera(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addVoceLibera(); if (e.key === 'Escape') setShowNotaForm(false) }}
                      placeholder="Descrivi la richiesta speciale…"
                      autoFocus
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={addVoceLibera} disabled={isPending || !notaLibera.trim()}
                      className="p-2 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setShowNotaForm(false); setNotaLibera('') }}
                      className="p-2 rounded text-slate-500 hover:bg-slate-700 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowNotaForm(true)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Aggiungi voce personalizzata
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Header categoria selezionata */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => { setSelectedCat(null); setSearchValue(null) }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  {cleanLabel(selectedSezione?.descrizione ?? selectedCat)}
                </button>
              </div>

              {/* Chip suggeriti */}
              {standardItems.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-1.5">Suggeriti</p>
                  <div className="flex flex-wrap gap-1.5">
                    {standardItems.map((a) => {
                      const added = addedCodes.has(a.cod_articolo)
                      return (
                        <button
                          key={a.cod_articolo}
                          onClick={() => !added && addArticolo(a.cod_articolo)}
                          disabled={added || isPending}
                          title={a.descrizione ?? a.cod_articolo}
                          className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                            added
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-indigo-300'
                          }`}
                        >
                          {added ? '✓ ' : '+ '}
                          {a.descrizione
                            ? cleanLabel(a.descrizione.length > 32 ? a.descrizione.slice(0, 32) + '…' : a.descrizione)
                            : a.cod_articolo}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Combobox ricerca */}
              <ArticoloCombobox
                value={searchValue}
                onChange={(cod) => {
                  if (cod) {
                    addArticolo(cod)
                    setSearchValue(null)
                  }
                }}
                codTipo={selectedCat}
                placeholder={`Cerca in ${cleanLabel(selectedSezione?.descrizione ?? selectedCat)}…`}
              />
            </div>
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
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: evento } = useQuery({
    queryKey: queryKeys.eventi.detail(idEvento),
    queryFn: () => getEvento(idEvento),
    enabled: !isNaN(idEvento),
  })

  const { data: lista = [], isLoading, isError } = useListaCarico(idEvento)
  const { data: sezioni = [] } = useLookupSezioni()
  const { data: articoli = [] } = useLookupArticoli()

  const addedCodes = useMemo(() => new Set(lista.map((i) => i.cod_articolo)), [lista])

  // Standard chips per sezione (rank IS NOT NULL, solo con descrizione, top 6)
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

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(`/gestionale/eventi/${idEvento}`)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
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
        {!isLoading && lista.length > 0 && (
          <span className="text-xs text-slate-500 tabular-nums shrink-0">
            {lista.length} articol{lista.length !== 1 ? 'i' : 'o'}
          </span>
        )}
      </div>

      {/* Parametri ospiti */}
      {evento && (
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
            {/* Tabella articoli */}
            {lista.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider">Articolo</th>
                    <th className="text-center px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider w-20">Ape</th>
                    <th className="text-center px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider w-20">Sedu</th>
                    <th className="text-center px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider w-20">Buf</th>
                    <th className="text-left px-3 py-2.5 font-medium text-slate-600 text-xs uppercase tracking-wider">Note</th>
                    <th className="w-20 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {lista.map((item) =>
                    editingId === item.id ? (
                      <EditRow key={item.id} item={item} idEvento={idEvento} onCancel={() => setEditingId(null)} />
                    ) : (
                      <ItemRow key={item.id} item={item} idEvento={idEvento} onEdit={() => setEditingId(item.id)} />
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

            {/* Spacer per spingere il pannello aggiungi in fondo */}
            <div className="flex-1" />
          </>
        )}

        {/* Pannello aggiungi — sempre visibile in fondo */}
        {!isLoading && !isError && (
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

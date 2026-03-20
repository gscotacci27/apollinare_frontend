import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, PackageX, Pencil, Trash2, X, Check, ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getEvento } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import { useListaCarico } from '@/hooks/useListaCarico'
import { useAddArticolo } from '@/hooks/useAddArticolo'
import { useUpdateArticolo } from '@/hooks/useUpdateArticolo'
import { useDeleteArticolo } from '@/hooks/useDeleteArticolo'
import { useLookupArticoli } from '@/hooks/useLookupArticoli'
import { useLookupSezioni } from '@/hooks/useLookupSezioni'
import { ArticoloCombobox } from './ArticoloCombobox'
import type { ListaCaricaItem, SezioneItem, ArticoloLookupItem, UpdateListaItemBody } from '@/types/gestionale'

// ── Helpers ────────────────────────────────────────────────────────────────────

const cleanLabel = (s: string) => s.replace(/^\?+\s*/, '')

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

// ── Edit inline ────────────────────────────────────────────────────────────────

const EditRow = ({
  item, idEvento, onCancel,
}: { item: ListaCaricaItem; idEvento: number; onCancel: () => void }) => {
  const [manApe, setManApe]   = useState(item.qta_man_ape)
  const [manSedu, setManSedu] = useState(item.qta_man_sedu)
  const [manBuf, setManBuf]   = useState(item.qta_man_bufdol)
  const [note, setNote]       = useState(item.note ?? '')
  const { mutate, isPending } = useUpdateArticolo(idEvento, onCancel)

  const save = () => mutate({
    itemId: item.id,
    body: {
      qta_man_ape: manApe, qta_man_sedu: manSedu,
      qta_man_bufdol: manBuf, note: note.trim() || null,
    } satisfies UpdateListaItemBody,
  })

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
    <tr className="bg-indigo-950/30 border-b border-slate-700/50">
      <td className="px-4 py-2.5 text-sm">
        <p className="text-slate-300 font-medium">{item.descrizione ?? item.cod_articolo}</p>
        <p className="text-xs text-slate-500">{item.cod_articolo}</p>
      </td>
      <td className="px-2 py-2.5" colSpan={3}>
        <div className="flex items-end gap-2 flex-wrap">
          {numInput(manApe,  setManApe,  '+Ape')}
          {numInput(manSedu, setManSedu, '+Sedu')}
          {numInput(manBuf,  setManBuf,  '+Buf')}
          <div className="flex flex-col gap-0.5 flex-1 min-w-28">
            <span className="text-xs text-slate-500">Note</span>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Note…"
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

  return (
    <tr className="border-b border-slate-800/40 hover:bg-slate-900/30 group transition-colors">
      <td className="px-4 py-2 text-sm">
        <p className="text-slate-200 truncate max-w-xs">{item.descrizione ?? item.cod_articolo}</p>
        <p className="text-xs text-slate-600">{item.cod_articolo}</p>
      </td>
      <td className="px-3 py-2 text-sm text-center w-16">
        <QtaCell auto={item.qta_ape} manual={item.qta_man_ape} />
      </td>
      <td className="px-3 py-2 text-sm text-center w-16">
        <QtaCell auto={item.qta_sedu} manual={item.qta_man_sedu} />
      </td>
      <td className="px-3 py-2 text-sm text-center w-16">
        <QtaCell auto={item.qta_bufdol} manual={item.qta_man_bufdol} />
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 max-w-[120px]">
        <span className="truncate block">{item.note ?? ''}</span>
      </td>
      <td className="px-3 py-2 w-20">
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

// ── Sezione ────────────────────────────────────────────────────────────────────

interface SectionProps {
  sezione: SezioneItem
  items: ListaCaricaItem[]
  standardItems: ArticoloLookupItem[]
  addedCodes: Set<string>
  idEvento: number
  editingId: number | null
  onEdit: (id: number | null) => void
}

const Section = ({
  sezione, items, standardItems, addedCodes, idEvento, editingId, onEdit,
}: SectionProps) => {
  const [open, setOpen] = useState(items.length > 0)
  const [showSearch, setShowSearch] = useState(false)
  const [searchValue, setSearchValue] = useState<string | null>(null)

  const { mutate: doAdd, isPending: isAdding } = useAddArticolo(idEvento)

  const addArticolo = (cod: string) => {
    doAdd({ cod_articolo: cod })
  }

  const handleSearchChange = (cod: string | null) => {
    if (cod) {
      addArticolo(cod)
      setSearchValue(null)
      setShowSearch(false)
    }
  }

  return (
    <div className="border-b border-slate-800">
      {/* Header sezione */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 hover:bg-slate-900 transition-colors text-left"
      >
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
        <span className="flex-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {cleanLabel(sezione.descrizione)}
        </span>
        {items.length > 0 && (
          <span className="text-xs text-slate-500 tabular-nums">
            {items.length} art.
          </span>
        )}
      </button>

      {open && (
        <div className="pb-2">
          {/* Articoli esistenti */}
          {items.length > 0 && (
            <table className="w-full text-sm mb-2">
              <tbody>
                {items.map((item) =>
                  editingId === item.id ? (
                    <EditRow key={item.id} item={item} idEvento={idEvento} onCancel={() => onEdit(null)} />
                  ) : (
                    <ItemRow key={item.id} item={item} idEvento={idEvento} onEdit={() => onEdit(item.id)} />
                  )
                )}
              </tbody>
            </table>
          )}

          {/* Chip standard */}
          {standardItems.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-slate-600 mb-1.5">Standard</p>
              <div className="flex flex-wrap gap-1.5">
                {standardItems.map((a) => {
                  const added = addedCodes.has(a.cod_articolo)
                  return (
                    <button
                      key={a.cod_articolo}
                      onClick={() => !added && addArticolo(a.cod_articolo)}
                      disabled={added || isAdding}
                      title={a.descrizione ?? a.cod_articolo}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                        added
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-500/50 hover:text-indigo-300'
                      }`}
                    >
                      {added ? '✓ ' : '+ '}
                      {a.descrizione
                        ? (a.descrizione.length > 30
                            ? a.descrizione.slice(0, 30) + '…'
                            : a.descrizione)
                        : a.cod_articolo}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cerca e aggiungi dalla sezione */}
          <div className="px-4 pt-1">
            {showSearch ? (
              <div className="flex items-center gap-2">
                <ArticoloCombobox
                  value={searchValue}
                  onChange={handleSearchChange}
                  codTipo={sezione.cod_tipo}
                  placeholder={`Cerca in ${cleanLabel(sezione.descrizione)}…`}
                  className="flex-1"
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchValue(null) }}
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors py-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi articolo
              </button>
            )}
          </div>
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

  // Set dei cod_articolo già in lista (per le chip)
  const addedCodes = useMemo(
    () => new Set(lista.map((i) => i.cod_articolo)),
    [lista],
  )

  // Articoli standard per sezione: rank IS NOT NULL, top 6 per rank ASC
  const standardByCodTipo = useMemo(() => {
    const map = new Map<string, ArticoloLookupItem[]>()
    for (const a of articoli) {
      if (a.cod_tipo && a.rank != null) {
        if (!map.has(a.cod_tipo)) map.set(a.cod_tipo, [])
        map.get(a.cod_tipo)!.push(a)
      }
    }
    // Sort per rank ASC e tronca a 6
    for (const [k, v] of map.entries()) {
      map.set(k, v.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)).slice(0, 6))
    }
    return map
  }, [articoli])

  // Items per sezione
  const itemsByCodTipo = useMemo(() => {
    const map = new Map<string, ListaCaricaItem[]>()
    for (const item of lista) {
      const key = item.cod_tipo ?? '__altro__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [lista])

  const totalArticoli = lista.length

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3 shrink-0">
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
              {evento.tot_ospiti != null && <> · {evento.tot_ospiti} ospiti</>}
            </p>
          )}
        </div>
        {!isLoading && totalArticoli > 0 && (
          <span className="text-xs text-slate-500 shrink-0 tabular-nums">
            {totalArticoli} articol{totalArticoli !== 1 ? 'i' : 'o'}
          </span>
        )}
      </div>

      {/* Header colonne (solo se ci sono articoli) */}
      {lista.length > 0 && (
        <div className="shrink-0 bg-slate-900 border-b border-slate-800">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600 uppercase tracking-wider">Articolo</th>
                <th className="text-center px-3 py-2 font-medium text-slate-600 uppercase tracking-wider w-16">Ape</th>
                <th className="text-center px-3 py-2 font-medium text-slate-600 uppercase tracking-wider w-16">Sedu</th>
                <th className="text-center px-3 py-2 font-medium text-slate-600 uppercase tracking-wider w-16">Buf</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600 uppercase tracking-wider">Note</th>
                <th className="w-20 px-3 py-2" />
              </tr>
            </thead>
          </table>
        </div>
      )}

      {/* Corpo */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />Caricamento…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-400 text-sm">
            Errore nel caricamento della lista di carico.
          </div>
        ) : sezioni.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-500">
            <PackageX className="w-8 h-8 text-slate-700" />
            <p className="text-sm">Nessuna sezione disponibile</p>
          </div>
        ) : (
          sezioni.map((s) => (
            <Section
              key={s.cod_tipo}
              sezione={s}
              items={itemsByCodTipo.get(s.cod_tipo) ?? []}
              standardItems={standardByCodTipo.get(s.cod_tipo) ?? []}
              addedCodes={addedCodes}
              idEvento={idEvento}
              editingId={editingId}
              onEdit={setEditingId}
            />
          ))
        )}
      </div>
    </div>
  )
}

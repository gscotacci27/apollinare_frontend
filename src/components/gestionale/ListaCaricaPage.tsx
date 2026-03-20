import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Loader2, PackageX, Pencil, Trash2, X, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getEvento } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import { useListaCarico } from '@/hooks/useListaCarico'
import { useUpdateArticolo } from '@/hooks/useUpdateArticolo'
import { useDeleteArticolo } from '@/hooks/useDeleteArticolo'
import { AddArticoloModal } from './AddArticoloModal'
import type { ListaCaricaItem, UpdateListaItemBody } from '@/types/gestionale'

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Rimuove il prefisso '?' che alcuni tipi hanno nel DB Oracle legacy */
const cleanLabel = (s: string) => s.replace(/^\?+\s*/, '')

const QtaCell = ({ auto, manual }: { auto: number; manual: number }) => {
  const effective = auto + manual
  if (effective === 0) return <span className="text-slate-600">—</span>
  return (
    <span className="tabular-nums">
      <span className="text-slate-200">{auto}</span>
      {manual > 0 && <span className="text-indigo-400 text-xs ml-0.5">+{manual}</span>}
    </span>
  )
}

// ── Edit inline ────────────────────────────────────────────────────────────────

const EditRow = ({
  item,
  idEvento,
  onCancel,
}: {
  item: ListaCaricaItem
  idEvento: number
  onCancel: () => void
}) => {
  const [manApe,  setManApe]  = useState(item.qta_man_ape)
  const [manSedu, setManSedu] = useState(item.qta_man_sedu)
  const [manBuf,  setManBuf]  = useState(item.qta_man_bufdol)
  const [note,    setNote]    = useState(item.note ?? '')

  const { mutate, isPending } = useUpdateArticolo(idEvento, onCancel)

  const save = () =>
    mutate({
      itemId: item.id,
      body: {
        qta_man_ape: manApe,
        qta_man_sedu: manSedu,
        qta_man_bufdol: manBuf,
        note: note.trim() || null,
      } satisfies UpdateListaItemBody,
    })

  const numInput = (val: number, setter: (v: number) => void, label: string) => (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <input
        type="number"
        min={0}
        step={1}
        value={val}
        onChange={(e) => setter(Number(e.target.value))}
        className="w-16 bg-slate-800 border border-slate-600 rounded px-1.5 py-1 text-sm text-slate-100 text-center focus:outline-none focus:border-indigo-500"
      />
    </div>
  )

  return (
    <tr className="bg-indigo-950/30 border-b border-slate-800">
      <td className="px-4 py-3 text-sm">
        <p className="text-slate-300 font-medium">{item.descrizione ?? item.cod_articolo}</p>
        <p className="text-xs text-slate-500">{item.cod_articolo}</p>
      </td>
      <td className="px-2 py-3" colSpan={3}>
        <div className="flex items-end gap-3 flex-wrap">
          {numInput(manApe,  setManApe,  '+Ape')}
          {numInput(manSedu, setManSedu, '+Sedu')}
          {numInput(manBuf,  setManBuf,  '+Buf')}
          <div className="flex flex-col gap-0.5 flex-1 min-w-32">
            <span className="text-xs text-slate-500">Note</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note…"
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={save}
            disabled={isPending}
            className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded text-slate-500 hover:bg-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Riga normale ───────────────────────────────────────────────────────────────

const ItemRow = ({
  item,
  idEvento,
  onEdit,
}: {
  item: ListaCaricaItem
  idEvento: number
  onEdit: () => void
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { mutate: doDelete, isPending: isDeleting } = useDeleteArticolo(idEvento)

  return (
    <tr className="border-b border-slate-800/40 hover:bg-slate-900/40 group transition-colors">
      <td className="px-4 py-2.5 text-sm">
        <p className="text-slate-200 truncate max-w-xs">{item.descrizione ?? item.cod_articolo}</p>
        <p className="text-xs text-slate-600">{item.cod_articolo}</p>
      </td>
      <td className="px-3 py-2.5 text-sm text-center">
        <QtaCell auto={item.qta_ape} manual={item.qta_man_ape} />
      </td>
      <td className="px-3 py-2.5 text-sm text-center">
        <QtaCell auto={item.qta_sedu} manual={item.qta_man_sedu} />
      </td>
      <td className="px-3 py-2.5 text-sm text-center">
        <QtaCell auto={item.qta_bufdol} manual={item.qta_man_bufdol} />
      </td>
      <td className="px-4 py-2.5 text-xs text-slate-500 max-w-[140px]">
        <span className="truncate block">{item.note ?? ''}</span>
      </td>
      <td className="px-4 py-2.5 w-24">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {confirmDelete ? (
            <>
              <button
                onClick={() => doDelete(item.id)}
                disabled={isDeleting}
                className="px-2 py-0.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors disabled:opacity-50"
              >
                {isDeleting ? '…' : 'Elimina'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                title="Modifica quantità"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Rimuovi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Sezione collassabile ───────────────────────────────────────────────────────

const Section = ({
  label,
  items,
  idEvento,
  editingId,
  onEdit,
  defaultOpen = true,
}: {
  label: string
  items: ListaCaricaItem[]
  idEvento: number
  editingId: number | null
  onEdit: (id: number | null) => void
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-800">
      {/* Section header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 transition-colors text-left"
      >
        {open
          ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex-1">
          {cleanLabel(label)}
        </span>
        <span className="text-xs text-slate-600 tabular-nums">
          {items.length} art.
        </span>
      </button>

      {open && (
        <table className="w-full text-sm">
          <tbody>
            {items.map((item) =>
              editingId === item.id ? (
                <EditRow
                  key={item.id}
                  item={item}
                  idEvento={idEvento}
                  onCancel={() => onEdit(null)}
                />
              ) : (
                <ItemRow
                  key={item.id}
                  item={item}
                  idEvento={idEvento}
                  onEdit={() => onEdit(item.id)}
                />
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Pagina principale ─────────────────────────────────────────────────────────

export const ListaCaricaPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const idEvento = Number(id)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const { data: evento } = useQuery({
    queryKey: queryKeys.eventi.detail(idEvento),
    queryFn: () => getEvento(idEvento),
    enabled: !isNaN(idEvento),
  })

  const { data: lista = [], isLoading, isError } = useListaCarico(idEvento)

  // Raggruppa per sezione, ordinate per cod_step
  const sections = useMemo(() => {
    const map = new Map<string, { step: number; items: ListaCaricaItem[] }>()

    for (const item of lista) {
      const key = item.tipo_descrizione ?? 'Altro'
      const step = item.cod_step ?? 999
      if (!map.has(key)) map.set(key, { step, items: [] })
      map.get(key)!.items.push(item)
    }

    return Array.from(map.entries())
      .sort((a, b) => a[1].step - b[1].step)
      .map(([label, { items }]) => ({ label, items }))
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
              {evento.descrizione ?? '(senza titolo)'}
              {evento.data && <> · {evento.data}</>}
              {evento.tot_ospiti != null && <> · {evento.tot_ospiti} ospiti</>}
            </p>
          )}
        </div>

        {!isLoading && totalArticoli > 0 && (
          <span className="text-xs text-slate-500 shrink-0">
            {totalArticoli} articol{totalArticoli !== 1 ? 'i' : 'o'}
          </span>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md font-medium transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi
        </button>
      </div>

      {/* Colonne header (sticky) */}
      {lista.length > 0 && (
        <div className="shrink-0 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-500 uppercase tracking-wider">
                  Articolo
                </th>
                <th className="text-center px-3 py-2 font-medium text-slate-500 uppercase tracking-wider w-20">
                  Ape
                </th>
                <th className="text-center px-3 py-2 font-medium text-slate-500 uppercase tracking-wider w-20">
                  Sedu
                </th>
                <th className="text-center px-3 py-2 font-medium text-slate-500 uppercase tracking-wider w-20">
                  Buf
                </th>
                <th className="text-left px-4 py-2 font-medium text-slate-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="w-24 px-4 py-2" />
              </tr>
            </thead>
          </table>
        </div>
      )}

      {/* Lista suddivisa per sezioni */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Caricamento lista…
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-400 text-sm">
            Errore nel caricamento della lista di carico.
          </div>
        ) : lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-500">
            <PackageX className="w-8 h-8 text-slate-700" />
            <p className="text-sm">Nessun articolo in lista</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Aggiungi il primo articolo →
            </button>
          </div>
        ) : (
          sections.map(({ label, items }) => (
            <Section
              key={label}
              label={label}
              items={items}
              idEvento={idEvento}
              editingId={editingId}
              onEdit={setEditingId}
            />
          ))
        )}
      </div>

      {showAddModal && (
        <AddArticoloModal
          idEvento={idEvento}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

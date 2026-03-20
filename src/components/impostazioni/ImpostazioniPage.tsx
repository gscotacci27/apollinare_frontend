import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Package, Layers, Users, Pencil, Check, X, Trash2, Merge, Plus, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getTabelleLocation, getLocationSimili, renameLocation, deleteLocation, mergeLocation,
  getTabelleArticoli, patchArticolo, createArticolo,
  getTabelleSezioni, patchSezione,
  getTabelleOspiti, patchTipoOspite,
  type LocationConUso, type ArticoloTabella, type SezioneTabella,
} from '@/services/tabelle'
import { queryKeys } from '@/services/queryKeys'

type Tab = 'location' | 'articoli' | 'sezioni' | 'ospiti'

// ── helpers ────────────────────────────────────────────────────────────────────

function n(v: number | null | undefined, dec = 2) {
  if (v == null) return '—'
  return v.toFixed(dec)
}

function InlineEdit({
  value,
  onSave,
  className = '',
}: {
  value: string
  onSave: (v: string) => Promise<void>
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!draft.trim() || draft.trim() === value) { setEditing(false); return }
    setSaving(true)
    try {
      await onSave(draft.trim())
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <button
        className={`group flex items-center gap-1.5 text-left hover:text-slate-100 transition-colors ${className}`}
        onClick={() => { setDraft(value); setEditing(true) }}
      >
        {value}
        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 shrink-0" />
      </button>
    )
  }

  return (
    <span className="flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        className="bg-slate-800 border border-indigo-500 rounded px-2 py-0.5 text-sm text-slate-100 focus:outline-none w-48"
      />
      <button onClick={save} disabled={saving} className="text-indigo-400 hover:text-indigo-300">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => setEditing(false)} className="text-slate-500 hover:text-slate-300">
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB LOCATION
// ══════════════════════════════════════════════════════════════════════════════

function MergeModal({
  source,
  onClose,
}: {
  source: LocationConUso
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [targetId, setTargetId] = useState<number | null>(null)

  const { data: simili = [], isLoading } = useQuery({
    queryKey: queryKeys.tabelle.locationSimili(source.id),
    queryFn: () => getLocationSimili(source.id),
  })

  const { data: tutte = [] } = useQuery({
    queryKey: queryKeys.tabelle.location,
    queryFn: getTabelleLocation,
  })

  const { mutate: doMerge, isPending } = useMutation({
    mutationFn: () => mergeLocation(source.id, targetId!),
    onSuccess: (res) => {
      toast.success(`Merge completato — ${res.eventi_spostati} eventi spostati`)
      qc.invalidateQueries({ queryKey: queryKeys.tabelle.location })
      qc.invalidateQueries({ queryKey: queryKeys.lookup.location })
      onClose()
    },
    onError: () => toast.error('Errore durante il merge'),
  })

  const candidati = search.trim()
    ? tutte.filter((l) => l.id !== source.id && l.location.toLowerCase().includes(search.toLowerCase()))
    : simili.map((s) => tutte.find((l) => l.id === s.id)).filter(Boolean) as LocationConUso[]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-96 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100">Unisci location</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Stai unendo <span className="text-slate-200 font-medium">"{source.location}"</span> in un'altra location.
          Tutti i {source.n_eventi} eventi saranno spostati alla location selezionata.
        </p>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca o scegli dalla lista simili…"
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>
        ) : (
          <>
            {!search.trim() && simili.length > 0 && (
              <p className="text-[10px] text-slate-600 mb-1 uppercase tracking-wide">Simili (fuzzy match)</p>
            )}
            <ul className="space-y-1 max-h-48 overflow-y-auto mb-4">
              {candidati.map((loc) => {
                const sim = simili.find((s) => s.id === loc.id)
                return (
                  <li key={loc.id}>
                    <button
                      onClick={() => setTargetId(loc.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                        targetId === loc.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="truncate">{loc.location}</span>
                      <span className="shrink-0 ml-2 text-[10px] opacity-60">
                        {sim ? `${Math.round(sim.similarita * 100)}%` : `${loc.n_eventi} ev.`}
                      </span>
                    </button>
                  </li>
                )
              })}
              {candidati.length === 0 && (
                <li className="text-xs text-slate-600 text-center py-3">Nessun risultato</li>
              )}
            </ul>
          </>
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
            Annulla
          </button>
          <button
            onClick={() => doMerge()}
            disabled={!targetId || isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md font-medium transition-colors"
          >
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Merge className="w-3.5 h-3.5" />}
            Unisci
          </button>
        </div>
      </div>
    </div>
  )
}

function TabLocation() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [mergeSource, setMergeSource] = useState<LocationConUso | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const { data: locations = [], isLoading } = useQuery({
    queryKey: queryKeys.tabelle.location,
    queryFn: getTabelleLocation,
    staleTime: 30_000,
  })

  const { mutate: doRename } = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => renameLocation(id, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tabelle.location })
      qc.invalidateQueries({ queryKey: queryKeys.lookup.location })
      toast.success('Location rinominata')
    },
    onError: () => toast.error('Errore durante la rinomina'),
  })

  const { mutate: doDelete } = useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tabelle.location })
      qc.invalidateQueries({ queryKey: queryKeys.lookup.location })
      toast.success('Location eliminata')
      setConfirmDelete(null)
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? 'Errore durante l\'eliminazione')
      setConfirmDelete(null)
    },
  })

  const filtered = search.trim()
    ? locations.filter((l) => l.location.toLowerCase().includes(search.toLowerCase()))
    : locations

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca location…"
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} / {locations.length}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-4 h-4 animate-spin text-slate-600" /></div>
      ) : (
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
              <tr className="text-slate-500 uppercase tracking-wide">
                <th className="text-left px-3 py-2 w-16 font-medium">ID</th>
                <th className="text-left px-3 py-2 font-medium">Nome</th>
                <th className="text-right px-3 py-2 w-20 font-medium">Eventi</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-3 py-2 text-slate-600 font-mono">{loc.id}</td>
                  <td className="px-3 py-2 text-slate-300">
                    <InlineEdit
                      value={loc.location}
                      onSave={(v) => new Promise((res, rej) =>
                        doRename({ id: loc.id, name: v }, { onSuccess: () => res(), onError: rej })
                      )}
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-slate-400">{loc.n_eventi}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Unisci in altra location"
                        onClick={() => setMergeSource(loc)}
                        className="p-1 rounded text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                      >
                        <Merge className="w-3.5 h-3.5" />
                      </button>
                      {confirmDelete === loc.id ? (
                        <>
                          <button
                            onClick={() => doDelete(loc.id)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-medium"
                          >Elimina</button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="p-1 rounded text-slate-500 hover:text-slate-300"
                          ><X className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <button
                          title={loc.n_eventi > 0 ? `Usata da ${loc.n_eventi} eventi` : 'Elimina'}
                          disabled={loc.n_eventi > 0}
                          onClick={() => setConfirmDelete(loc.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mergeSource && <MergeModal source={mergeSource} onClose={() => setMergeSource(null)} />}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB ARTICOLI
// ══════════════════════════════════════════════════════════════════════════════

function ArticoloRow({ a, onSaved }: { a: ArticoloTabella; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fields, setFields] = useState({
    descrizione: a.descrizione ?? '',
    qta_giac: a.qta_giac ?? 0,
    rank: a.rank ?? '',
    coeff_a: a.coeff_a ?? '',
    coeff_s: a.coeff_s ?? '',
    coeff_b: a.coeff_b ?? '',
    qta_std_a: a.qta_std_a ?? '',
    qta_std_s: a.qta_std_s ?? '',
    qta_std_b: a.qta_std_b ?? '',
  })

  const save = async () => {
    setSaving(true)
    try {
      await patchArticolo(a.cod_articolo, {
        descrizione: fields.descrizione || undefined,
        qta_giac: Number(fields.qta_giac) || undefined,
        rank: fields.rank !== '' ? Number(fields.rank) : undefined,
        coeff_a: fields.coeff_a !== '' ? Number(fields.coeff_a) : undefined,
        coeff_s: fields.coeff_s !== '' ? Number(fields.coeff_s) : undefined,
        coeff_b: fields.coeff_b !== '' ? Number(fields.coeff_b) : undefined,
        qta_std_a: fields.qta_std_a !== '' ? Number(fields.qta_std_a) : undefined,
        qta_std_s: fields.qta_std_s !== '' ? Number(fields.qta_std_s) : undefined,
        qta_std_b: fields.qta_std_b !== '' ? Number(fields.qta_std_b) : undefined,
      })
      toast.success(`${a.cod_articolo} aggiornato`)
      setOpen(false)
      onSaved()
    } catch {
      toast.error('Errore salvataggio')
    } finally {
      setSaving(false)
    }
  }

  const inp = (label: string, key: keyof typeof fields, type: 'text' | 'number' = 'number') => (
    <div>
      <label className="block text-[10px] text-slate-500 mb-0.5">{label}</label>
      <input
        type={type}
        value={String(fields[key])}
        onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
      />
    </div>
  )

  return (
    <>
      <tr
        className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-3 py-2 font-mono text-slate-400">{a.cod_articolo}</td>
        <td className="px-3 py-2 text-slate-200">{a.descrizione ?? '—'}</td>
        <td className="px-3 py-2 text-slate-400 text-right">{n(a.qta_giac, 0)}</td>
        <td className="px-3 py-2 text-slate-500">{a.tipo_desc ?? '—'}</td>
        <td className="px-3 py-2 text-right text-slate-500">{n(a.rank, 0)}</td>
        <td className="px-3 py-2 text-right">
          {open
            ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 ml-auto" />
            : <ChevronDown className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />}
        </td>
      </tr>
      {open && (
        <tr className="bg-slate-900/80">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-2">{inp('Descrizione', 'descrizione', 'text')}</div>
              <div>{inp('Giacenza', 'qta_giac')}</div>
              <div>{inp('Rank', 'rank')}</div>
              <div>{inp('Coeff Ape', 'coeff_a')}</div>
              <div>{inp('Coeff Seduto', 'coeff_s')}</div>
              <div>{inp('Coeff Buf.Dolci', 'coeff_b')}</div>
              <div>{inp('Qtà Std Ape', 'qta_std_a')}</div>
              <div>{inp('Qtà Std Seduto', 'qta_std_s')}</div>
              <div>{inp('Qtà Std Buf.Dolci', 'qta_std_b')}</div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1">
                Annulla
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-md font-medium transition-colors"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Salva
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function NuovoArticoloForm({ onSaved }: { onSaved: () => void }) {
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [f, setF] = useState({ cod_articolo: '', descrizione: '', qta_giac: '0' })

  const save = async () => {
    if (!f.cod_articolo.trim() || !f.descrizione.trim()) return
    setSaving(true)
    try {
      await createArticolo({
        cod_articolo: f.cod_articolo.trim(),
        descrizione: f.descrizione.trim(),
        qta_giac: Number(f.qta_giac) || 0,
      })
      toast.success(`Articolo ${f.cod_articolo.trim().toUpperCase()} creato`)
      setF({ cod_articolo: '', descrizione: '', qta_giac: '0' })
      setShow(false)
      onSaved()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Errore creazione articolo')
    } finally {
      setSaving(false)
    }
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Nuovo articolo
      </button>
    )
  }

  return (
    <div className="flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3">
      <div>
        <label className="block text-[10px] text-slate-500 mb-0.5">Codice</label>
        <input
          autoFocus
          value={f.cod_articolo}
          onChange={(e) => setF((v) => ({ ...v, cod_articolo: e.target.value.toUpperCase() }))}
          placeholder="COD"
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 w-28 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="flex-1">
        <label className="block text-[10px] text-slate-500 mb-0.5">Descrizione</label>
        <input
          value={f.descrizione}
          onChange={(e) => setF((v) => ({ ...v, descrizione: e.target.value }))}
          placeholder="Nome articolo…"
          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-[10px] text-slate-500 mb-0.5">Giacenza</label>
        <input
          type="number"
          value={f.qta_giac}
          onChange={(e) => setF((v) => ({ ...v, qta_giac: e.target.value }))}
          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 w-20 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <button
        onClick={save}
        disabled={saving || !f.cod_articolo.trim() || !f.descrizione.trim()}
        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-md font-medium"
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        Crea
      </button>
      <button onClick={() => setShow(false)} className="text-slate-500 hover:text-slate-300 p-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function TabArticoli() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const onSearch = (v: string) => {
    setSearch(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(v), 300)
  }

  const { data: articoli = [], isLoading } = useQuery({
    queryKey: queryKeys.tabelle.articoli(debouncedSearch),
    queryFn: () => getTabelleArticoli(debouncedSearch || undefined),
    staleTime: 30_000,
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['tabelle', 'articoli'] })

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cerca articolo…"
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <NuovoArticoloForm onSaved={refresh} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-4 h-4 animate-spin text-slate-600" /></div>
      ) : (
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
              <tr className="text-slate-500 uppercase tracking-wide">
                <th className="text-left px-3 py-2 font-medium w-28">Codice</th>
                <th className="text-left px-3 py-2 font-medium">Descrizione</th>
                <th className="text-right px-3 py-2 font-medium w-20">Giacenza</th>
                <th className="text-left px-3 py-2 font-medium w-40">Sezione</th>
                <th className="text-right px-3 py-2 font-medium w-16">Rank</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {articoli.map((a) => (
                <ArticoloRow key={a.cod_articolo} a={a} onSaved={refresh} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB SEZIONI
// ══════════════════════════════════════════════════════════════════════════════

function TabSezioni() {
  const qc = useQueryClient()
  const { data: sezioni = [], isLoading } = useQuery({
    queryKey: queryKeys.tabelle.sezioni,
    queryFn: getTabelleSezioni,
    staleTime: 30_000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.tabelle.sezioni })

  return isLoading ? (
    <div className="flex justify-center py-12"><Loader2 className="w-4 h-4 animate-spin text-slate-600" /></div>
  ) : (
    <div className="overflow-y-auto flex-1">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
          <tr className="text-slate-500 uppercase tracking-wide">
            <th className="text-left px-3 py-2 font-medium w-28">Codice</th>
            <th className="text-left px-3 py-2 font-medium">Descrizione</th>
            <th className="text-right px-3 py-2 font-medium w-20">Ordine</th>
            <th className="text-right px-3 py-2 font-medium w-24">Articoli</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {sezioni.map((s: SezioneTabella) => (
            <tr key={s.cod_tipo} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-3 py-2 font-mono text-slate-400">{s.cod_tipo}</td>
              <td className="px-3 py-2 text-slate-300">
                <InlineEdit
                  value={s.descrizione ?? s.cod_tipo}
                  onSave={(v) => patchSezione(s.cod_tipo, { descrizione: v }).then(invalidate)}
                />
              </td>
              <td className="px-3 py-2 text-right">
                <InlineEdit
                  value={String(s.cod_step)}
                  onSave={(v) => patchSezione(s.cod_tipo, { cod_step: Number(v) }).then(invalidate)}
                  className="justify-end text-slate-400"
                />
              </td>
              <td className="px-3 py-2 text-right text-slate-500">{s.n_articoli}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB TIPI OSPITI
// ══════════════════════════════════════════════════════════════════════════════

function TabOspiti() {
  const qc = useQueryClient()
  const { data: ospiti = [], isLoading } = useQuery({
    queryKey: queryKeys.tabelle.ospiti,
    queryFn: getTabelleOspiti,
    staleTime: 30_000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.tabelle.ospiti })

  return isLoading ? (
    <div className="flex justify-center py-12"><Loader2 className="w-4 h-4 animate-spin text-slate-600" /></div>
  ) : (
    <div className="overflow-y-auto flex-1">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
          <tr className="text-slate-500 uppercase tracking-wide">
            <th className="text-left px-3 py-2 font-medium w-24">Codice</th>
            <th className="text-left px-3 py-2 font-medium">Descrizione</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {ospiti.map((o) => (
            <tr key={o.cod_tipo} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-3 py-2 font-mono text-slate-400">{o.cod_tipo}</td>
              <td className="px-3 py-2 text-slate-300">
                <InlineEdit
                  value={o.descrizione ?? ''}
                  onSave={(v) => patchTipoOspite(o.cod_tipo, v).then(invalidate)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════════════════════════

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'location', label: 'Location',    icon: <MapPin  className="w-3.5 h-3.5" /> },
  { id: 'articoli', label: 'Articoli',    icon: <Package className="w-3.5 h-3.5" /> },
  { id: 'sezioni',  label: 'Sezioni',     icon: <Layers  className="w-3.5 h-3.5" /> },
  { id: 'ospiti',   label: 'Tipi Ospiti', icon: <Users   className="w-3.5 h-3.5" /> },
]

export const ImpostazioniPage = () => {
  const [tab, setTab] = useState<Tab>('location')

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 shrink-0">
        <h1 className="text-sm font-semibold text-slate-100">Impostazioni</h1>
        <p className="text-xs text-slate-500 mt-0.5">Gestione tabelle statiche</p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-0 border-b border-slate-800 flex gap-1 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-t-md font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'text-slate-100 border-indigo-500 bg-slate-900/50'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-4">
        {tab === 'location' && <TabLocation />}
        {tab === 'articoli' && <TabArticoli />}
        {tab === 'sezioni'  && <TabSezioni />}
        {tab === 'ospiti'   && <TabOspiti />}
      </div>
    </div>
  )
}

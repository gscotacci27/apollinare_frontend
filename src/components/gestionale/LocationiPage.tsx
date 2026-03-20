import { useState } from 'react'
import { MapPin, Plus, Search, Loader2, X } from 'lucide-react'
import { useLookupLocation } from '@/hooks/useLookupLocation'
import { useCreateLocation } from '@/hooks/useCreateLocation'

export const LocationiPage = () => {
  const { data: locations = [], isLoading } = useLookupLocation()
  const { mutate: doCreate, isPending: isCreating } = useCreateLocation()

  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = search.trim()
    ? locations.filter((l) => l.location.toLowerCase().includes(search.toLowerCase()))
    : locations

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    doCreate(name, {
      onSuccess: () => {
        setNewName('')
        setShowAdd(false)
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setShowAdd(false); setNewName('') }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-100">Location</h1>
          {!isLoading && (
            <p className="text-xs text-slate-500 mt-0.5">{locations.length} location{locations.length !== 1 ? 'i' : 'e'}</p>
          )}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi
        </button>
      </div>

      {/* Inline add form */}
      {showAdd && (
        <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0 bg-slate-900">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome location…"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={isCreating || !newName.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-md font-medium transition-colors"
          >
            {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Salva'}
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewName('') }}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-3 border-b border-slate-800 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca location…"
            className="w-full bg-slate-800 border border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Caricamento…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-500 text-sm">
            Nessuna location trovata
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="text-left px-6 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider w-16">ID</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loc, i) => (
                <tr
                  key={loc.id}
                  className={`border-b border-slate-800/50 ${i % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/30'}`}
                >
                  <td className="px-6 py-2.5 text-slate-500 font-mono text-xs">{loc.id}</td>
                  <td className="px-4 py-2.5 text-slate-200 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    {loc.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

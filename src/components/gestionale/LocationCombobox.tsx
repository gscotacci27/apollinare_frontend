import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { MapPin, Plus, X, Loader2 } from 'lucide-react'
import { useLookupLocation } from '@/hooks/useLookupLocation'
import { useCreateLocation } from '@/hooks/useCreateLocation'
import type { LocationItem } from '@/types/gestionale'

interface Props {
  value: number | null
  onChange: (id: number | null, location?: LocationItem) => void
  placeholder?: string
  canCreate?: boolean   // mostra opzione "Crea nuova location"
  className?: string
}

export const LocationCombobox = ({
  value,
  onChange,
  placeholder = 'Cerca location…',
  canCreate = false,
  className = '',
}: Props) => {
  const { data: locations = [] } = useLookupLocation()
  const { mutate: doCreate, isPending: isCreating } = useCreateLocation((loc) => {
    onChange(loc.id, loc)
    setOpen(false)
    setSearch('')
  })

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [highlighted, setHighlighted] = useState(0)

  // Label della location selezionata
  const selectedLabel = value != null
    ? (locations.find((l) => l.id === value)?.location ?? `Location #${value}`)
    : null

  // Filtra per testo (max 50 risultati per performance)
  const filtered = search.trim()
    ? locations
        .filter((l) => l.location.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 50)
    : locations.slice(0, 50)

  const showCreate = canCreate && search.trim().length > 1 &&
    !filtered.some((l) => l.location.toLowerCase() === search.trim().toLowerCase())

  useEffect(() => { setHighlighted(0) }, [search])

  // Chiudi se click fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !inputRef.current?.parentElement?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (loc: LocationItem) => {
    onChange(loc.id, loc)
    setOpen(false)
    setSearch('')
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearch('')
    setOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const total = filtered.length + (showCreate ? 1 : 0)
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => (h + 1) % total) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted((h) => (h - 1 + total) % total) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted < filtered.length) select(filtered[highlighted])
      else if (showCreate) doCreate(search.trim())
    }
    if (e.key === 'Escape') { setOpen(false); setSearch('') }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Input / display */}
      <div
        className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-3 py-2 cursor-text focus-within:border-indigo-500 transition-colors"
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-2" />
        {!open && selectedLabel ? (
          <span className="text-sm text-slate-100 flex-1 truncate">{selectedLabel}</span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={open ? search : ''}
            placeholder={selectedLabel ?? placeholder}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none min-w-0"
          />
        )}
        {value != null && (
          <button onClick={clear} className="ml-1 text-slate-500 hover:text-slate-300 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-xl overflow-y-auto max-h-56"
        >
          {filtered.length === 0 && !showCreate && (
            <p className="px-3 py-2 text-xs text-slate-500">Nessuna location trovata</p>
          )}

          {filtered.map((loc, i) => (
            <button
              key={loc.id}
              onMouseDown={(e) => { e.preventDefault(); select(loc) }}
              onMouseEnter={() => setHighlighted(i)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                i === highlighted
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              {loc.location}
            </button>
          ))}

          {showCreate && (
            <button
              onMouseDown={(e) => { e.preventDefault(); doCreate(search.trim()) }}
              onMouseEnter={() => setHighlighted(filtered.length)}
              disabled={isCreating}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 border-t border-slate-700 transition-colors ${
                highlighted === filtered.length
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-400 hover:bg-slate-700'
              }`}
            >
              {isCreating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Plus className="w-3.5 h-3.5" />}
              Crea "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}

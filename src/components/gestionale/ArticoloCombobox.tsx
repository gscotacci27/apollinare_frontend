import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Package, X, Loader2 } from 'lucide-react'
import { useLookupArticoli } from '@/hooks/useLookupArticoli'
import type { ArticoloLookupItem } from '@/types/gestionale'

interface Props {
  value: string | null
  onChange: (cod: string | null, articolo?: ArticoloLookupItem) => void
  placeholder?: string
  className?: string
  codTipo?: string   // se valorizzato filtra per sezione
}

export const ArticoloCombobox = ({
  value,
  onChange,
  placeholder = 'Cerca articolo…',
  className = '',
  codTipo,
}: Props) => {
  const { data: rawArticoli = [], isLoading } = useLookupArticoli()
  const articoli = codTipo
    ? rawArticoli.filter((a) => a.cod_tipo === codTipo)
    : rawArticoli

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = value != null ? articoli.find((a) => a.cod_articolo === value) : null
  const selectedLabel = selected
    ? (selected.descrizione ?? selected.cod_articolo)
    : null

  const filtered = search.trim()
    ? articoli
        .filter((a) => {
          const q = search.toLowerCase()
          return (
            a.cod_articolo.toLowerCase().includes(q) ||
            (a.descrizione ?? '').toLowerCase().includes(q)
          )
        })
        .slice(0, 60)
    : articoli.slice(0, 60)

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

  const select = (a: ArticoloLookupItem) => {
    onChange(a.cod_articolo, a)
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
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => (h + 1) % Math.max(filtered.length, 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted((h) => (h - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlighted]) select(filtered[highlighted])
    }
    if (e.key === 'Escape') { setOpen(false); setSearch('') }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center bg-slate-800 border border-slate-700 rounded-md px-3 py-2 cursor-text focus-within:border-indigo-500 transition-colors"
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        <Package className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-2" />
        {!open && selectedLabel ? (
          <span className="text-sm text-slate-100 flex-1 truncate">{selectedLabel}</span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={open ? search : ''}
            placeholder={isLoading ? 'Caricamento…' : (selectedLabel ?? placeholder)}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none min-w-0"
          />
        )}
        {isLoading && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin shrink-0 ml-1" />}
        {value != null && !isLoading && (
          <button onClick={clear} className="ml-1 text-slate-500 hover:text-slate-300 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-xl overflow-y-auto max-h-64"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">Nessun articolo trovato</p>
          ) : (
            filtered.map((a, i) => (
              <button
                key={a.cod_articolo}
                onMouseDown={(e) => { e.preventDefault(); select(a) }}
                onMouseEnter={() => setHighlighted(i)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2 ${
                  i === highlighted
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-200 hover:bg-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate">{a.descrizione ?? a.cod_articolo}</p>
                  <p className={`text-xs truncate ${i === highlighted ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {a.cod_articolo}
                  </p>
                </div>
                {a.qta_giac != null && (
                  <span className={`text-xs shrink-0 px-1.5 py-0.5 rounded ${
                    i === highlighted
                      ? 'bg-indigo-500/50 text-indigo-100'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {a.qta_giac >= 9999 ? '∞' : `×${a.qta_giac}`}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

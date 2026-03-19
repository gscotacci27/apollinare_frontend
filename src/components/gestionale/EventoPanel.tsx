import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { getEvento } from '@/services/gestionale'
import { AnagraficaTab } from './tabs/AnagraficaTab'
import { OspitiTab } from './tabs/OspitiTab'
import { MiseEnPlaceTab } from './tabs/MiseEnPlaceTab'
import { MenuTab } from './tabs/MenuTab'
import { PreventivoTab } from './tabs/PreventivoTab'

interface Props {
  idEvento: number
  onClose: () => void
}

const TABS = ['Anagrafica', 'Ospiti', 'Mise en Place', 'Menu', 'Preventivo'] as const
type Tab = typeof TABS[number]

export function EventoPanel({ idEvento, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('Anagrafica')
  const panelRef = useRef<HTMLDivElement>(null)

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento', idEvento],
    queryFn: () => getEvento(idEvento),
  })

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-40 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            {isLoading ? (
              <span className="text-sm text-slate-400">Caricamento…</span>
            ) : (
              <>
                <h2 className="text-base font-semibold text-slate-800">
                  {evento?.cliente ?? `Evento #${idEvento}`}
                </h2>
                {evento?.data && (
                  <p className="text-xs text-slate-400 mt-0.5">{evento.data}</p>
                )}
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-200 px-5 shrink-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                tab === t
                  ? 'border-indigo-600 text-indigo-600 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center flex-1 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Caricamento…
            </div>
          ) : !evento ? (
            <div className="flex items-center justify-center flex-1 text-slate-400 text-sm">
              Evento non trovato.
            </div>
          ) : (
            <>
              {tab === 'Anagrafica'    && <AnagraficaTab evento={evento} />}
              {tab === 'Ospiti'        && <OspitiTab idEvento={evento.id} />}
              {tab === 'Mise en Place' && <MiseEnPlaceTab evento={evento} />}
              {tab === 'Menu'          && <MenuTab evento={evento} />}
              {tab === 'Preventivo'   && <PreventivoTab idEvento={evento.id} />}
            </>
          )}
        </div>
      </div>
    </>
  )
}

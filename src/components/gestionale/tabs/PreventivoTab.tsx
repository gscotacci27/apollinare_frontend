import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { getPreventivo } from '@/services/gestionale'

interface Props { idEvento: number }

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  )
}

function fmt(n: number) {
  return `€ ${n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function PreventivoTab({ idEvento }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['preventivo', idEvento],
    queryFn: () => getPreventivo(idEvento),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />Caricamento…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        Nessun preventivo disponibile.
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5 overflow-y-auto flex-1">
      {/* Ospiti */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Ospiti</h3>
        <Row label="Numero ospiti" value={String(data.ospiti.numero)} />
        <Row label="Costo per ospite" value={fmt(data.ospiti.costo)} />
      </section>

      {/* Articoli per tipo */}
      {data.articoli_per_tipo.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Articoli</h3>
          {data.articoli_per_tipo.map(a => (
            <div key={a.cod_tipo} className="flex justify-between py-2 border-b border-slate-100 text-sm">
              <div>
                <span className="text-slate-800">{a.descrizione}</span>
                <span className="text-slate-400 ml-2 text-xs">× {a.numero}</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-slate-800">{fmt(a.costo_ivato)}</div>
                <div className="text-xs text-slate-400">netto {fmt(a.costo)}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Extra */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Voci aggiuntive</h3>
        <Row label="Risorse" value={fmt(data.risorse)} />
        <Row label="Degustazioni detraibili" value={fmt(data.degustazioni_detraibili)} />
        <Row label="Extra" value={fmt(data.extra)} />
      </section>

      {/* Totali */}
      <section className="bg-slate-50 rounded-lg p-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Totale netto</span>
          <span className="font-medium text-slate-800">{fmt(data.totale_netto)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span className="text-slate-700">Totale IVA inclusa</span>
          <span className="text-indigo-700">{fmt(data.totale_ivato)}</span>
        </div>
      </section>
    </div>
  )
}

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getOspiti, upsertOspiti, getTipiOspiti } from '@/services/gestionale'
import type { OspitiItem } from '@/types/gestionale'

interface Props { idEvento: number }

const inputCls = 'w-full rounded border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400'

export function OspitiTab({ idEvento }: Props) {
  const qc = useQueryClient()

  const { data: tipiOspiti = [] } = useQuery({ queryKey: ['tipi-ospiti'], queryFn: getTipiOspiti })
  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['ospiti', idEvento],
    queryFn: () => getOspiti(idEvento),
  })

  const [rows, setRows] = useState<OspitiItem[]>([])
  const [initialised, setInitialised] = useState(false)

  if (!initialised && saved.length >= 0 && !isLoading) {
    setRows(saved.length > 0 ? saved : [])
    setInitialised(true)
  }

  const mutation = useMutation({
    mutationFn: () => upsertOspiti(idEvento, rows),
    onSuccess: () => {
      toast.success('Ospiti salvati')
      qc.invalidateQueries({ queryKey: ['ospiti', idEvento] })
      qc.invalidateQueries({ queryKey: ['eventi'] })
    },
    onError: () => toast.error('Errore nel salvataggio'),
  })

  const addRow = () => setRows(r => [...r, { cod_tipo_ospite: tipiOspiti[0]?.cod_tipo ?? '', numero: 0, costo: 0, sconto: 0, note: null, ordine: r.length }])
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i))
  const update = (i: number, k: keyof OspitiItem, v: string | number) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row))

  const totale = rows.reduce((s, r) => s + r.numero * (r.costo - r.sconto), 0)

  if (isLoading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin mr-2" />Caricamento…</div>

  return (
    <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left text-xs font-medium text-slate-500 py-2 pr-3">Tipo ospite</th>
            <th className="text-left text-xs font-medium text-slate-500 py-2 pr-3 w-20">N°</th>
            <th className="text-left text-xs font-medium text-slate-500 py-2 pr-3 w-24">Costo (€)</th>
            <th className="text-left text-xs font-medium text-slate-500 py-2 pr-3 w-24">Sconto (€)</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="py-1.5 pr-3">
                <select className={inputCls} value={row.cod_tipo_ospite} onChange={e => update(i, 'cod_tipo_ospite', e.target.value)}>
                  {tipiOspiti.map(t => <option key={t.cod_tipo} value={t.cod_tipo}>{t.descrizione}</option>)}
                </select>
              </td>
              <td className="py-1.5 pr-3">
                <input type="number" min={0} className={inputCls} value={row.numero} onChange={e => update(i, 'numero', Number(e.target.value))} />
              </td>
              <td className="py-1.5 pr-3">
                <input type="number" min={0} step={0.01} className={inputCls} value={row.costo} onChange={e => update(i, 'costo', Number(e.target.value))} />
              </td>
              <td className="py-1.5 pr-3">
                <input type="number" min={0} step={0.01} className={inputCls} value={row.sconto} onChange={e => update(i, 'sconto', Number(e.target.value))} />
              </td>
              <td className="py-1.5">
                <button onClick={() => removeRow(i)} className="text-slate-300 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800">
        <Plus className="w-3.5 h-3.5" /> Aggiungi tipo ospite
      </button>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-sm text-slate-500">
          Totale: <span className="font-semibold text-slate-800">€ {totale.toFixed(2)}</span>
        </span>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Salva ospiti
        </button>
      </div>
    </div>
  )
}

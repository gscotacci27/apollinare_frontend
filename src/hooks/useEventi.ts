import { useQuery } from '@tanstack/react-query'
import { getEventi, type GetEventiParams } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'

/**
 * Lista eventi con filtri opzionali (stato, date, location).
 * Tutti i filtri sono inclusi nel queryKey: ogni combinazione ha la
 * propria cache → al cambio filtro la lista si svuota immediatamente.
 */
export const useEventi = (filters: GetEventiParams = {}) =>
  useQuery({
    queryKey: queryKeys.eventi.list(filters),
    // signal cancella la richiesta HTTP se la queryKey cambia prima che risponda
    queryFn: ({ queryKey, signal }) => getEventi(queryKey[2] as GetEventiParams, signal),
    staleTime: Infinity,       // Mai stale → nessun background refetch su re-render
    gcTime: 0,                 // Rimuove la cache subito quando non ci sono observer
    refetchOnMount: 'always',  // Fetch fresco ad ogni mount/cambio-key (cambio filtro)
  })

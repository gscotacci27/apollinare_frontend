import { useQuery } from '@tanstack/react-query'
import { getEventi } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'

/**
 * Lista eventi per un dato stato (o tutti se undefined).
 *
 * Il queryKey include lo stato: React Query tratta ogni filtro come cache
 * indipendente, quindi al cambio filtro la lista si svuota immediatamente
 * senza che i dati vecchi trapelino nella nuova vista.
 */
export const useEventi = (stato?: number) =>
  useQuery({
    queryKey: queryKeys.eventi.list(stato),
    queryFn: () => getEventi(stato !== undefined ? { stato } : undefined),
    // Nessun placeholderData / keepPreviousData: al cambio filtro mostriamo
    // subito lo stato di loading invece di dati stantii.
    staleTime: 60_000,
  })

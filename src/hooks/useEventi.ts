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
    queryFn: () => getEventi(filters),
    staleTime: 60_000,
  })

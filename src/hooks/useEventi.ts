import { useQuery } from '@tanstack/react-query'
import { getEventi, type GetEventiParams } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'

/**
 * Lista eventi con filtri opzionali.
 * Usa React Query con queryKey distinta per filtro, così:
 * - nessuna contaminazione tra viste/filtro stato
 * - invalidateQueries dopo PATCH/CREATE aggiorna davvero la lista
 */
export const useEventi = (filters: GetEventiParams = {}) => {
  const query = useQuery({
    queryKey: queryKeys.eventi.list(filters),
    queryFn: () => getEventi(filters),
    placeholderData: undefined,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

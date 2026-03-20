import { useQuery } from '@tanstack/react-query'
import { getArticoliDisponibili } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'

export const useLookupArticoli = () =>
  useQuery({
    queryKey: queryKeys.lookup.articoli,
    queryFn: getArticoliDisponibili,
    staleTime: Infinity,
  })

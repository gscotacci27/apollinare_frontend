import { useQuery } from '@tanstack/react-query'
import { getSezioni } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'

export const useLookupSezioni = () =>
  useQuery({
    queryKey: queryKeys.lookup.sezioni,
    queryFn: getSezioni,
    staleTime: Infinity,
  })

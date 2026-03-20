import { useQuery } from '@tanstack/react-query'
import { getLocation } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'

export const useLookupLocation = () =>
  useQuery({
    queryKey: queryKeys.lookup.location,
    queryFn: getLocation,
    staleTime: Infinity, // i dati di lookup cambiano raramente
  })

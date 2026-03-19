import { useQuery } from '@tanstack/react-query'
import { getEventi } from '@/services/gestionale'

export const useEventi = (stato?: number) =>
  useQuery({
    queryKey: ['eventi'],
    queryFn: () => getEventi(),
    staleTime: 5 * 60_000,
    select: stato !== undefined
      ? (data) => data.filter(e => e.stato === stato)
      : undefined,
  })

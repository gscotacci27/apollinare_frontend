import { useQuery } from '@tanstack/react-query'
import { getEventi } from '@/services/gestionale'

export const useEventi = (stato?: number) =>
  useQuery({
    queryKey: ['eventi', stato],
    queryFn: () => getEventi(stato !== undefined ? { stato } : undefined),
    staleTime: 0,
    select: stato !== undefined
      ? (data) => data.filter(e => e.stato === stato)
      : undefined,
  })

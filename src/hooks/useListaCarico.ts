import { useQuery } from '@tanstack/react-query'
import { getListaCarico } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'

export const useListaCarico = (idEvento: number) =>
  useQuery({
    queryKey: queryKeys.lista.byEvento(idEvento),
    queryFn: () => getListaCarico(idEvento),
    staleTime: 30_000,
  })

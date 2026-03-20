import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteArticolo } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import type { ListaCaricaItem } from '@/types/gestionale'

export const useDeleteArticolo = (idEvento: number, onSuccess?: () => void) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (itemId: number) => deleteArticolo(idEvento, itemId),
    onSuccess: (_, itemId) => {
      qc.setQueryData<ListaCaricaItem[]>(
        queryKeys.lista.byEvento(idEvento),
        (old = []) => old.filter((item) => item.id !== itemId),
      )
      onSuccess?.()
    },
  })
}

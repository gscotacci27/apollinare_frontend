import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addArticolo } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import type { ListaCaricaItem } from '@/types/gestionale'

export const useAddArticolo = (
  idEvento: number,
  onSuccess?: (item: ListaCaricaItem) => void,
) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: Parameters<typeof addArticolo>[1]) =>
      addArticolo(idEvento, body),
    onSuccess: (item) => {
      // Aggiunge l'articolo in coda alla cache senza refetch
      qc.setQueryData<ListaCaricaItem[]>(
        queryKeys.lista.byEvento(idEvento),
        (old = []) => [...old, item],
      )
      onSuccess?.(item)
    },
  })
}

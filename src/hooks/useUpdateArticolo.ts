import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateArticolo } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import type { ListaCaricaItem, UpdateListaItemBody } from '@/types/gestionale'

export const useUpdateArticolo = (idEvento: number, onSuccess?: () => void) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, body }: { itemId: number; body: UpdateListaItemBody }) =>
      updateArticolo(idEvento, itemId, body),
    onSuccess: (_, { itemId, body }) => {
      qc.setQueryData<ListaCaricaItem[]>(
        queryKeys.lista.byEvento(idEvento),
        (old = []) =>
          old.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  qta_man_ape: body.qta_man_ape,
                  qta_man_sedu: body.qta_man_sedu,
                  qta_man_bufdol: body.qta_man_bufdol,
                  note: body.note,
                }
              : item,
          ),
      )
      onSuccess?.()
    },
  })
}

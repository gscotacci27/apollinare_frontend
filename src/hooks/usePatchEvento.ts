import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patchEvento } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import type { EventoResponse, PatchEventoBody } from '@/types/gestionale'

export const usePatchEvento = (idEvento: number, onSuccess?: () => void) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: PatchEventoBody) => patchEvento(idEvento, body),
    onSuccess: (_, body) => {
      qc.setQueryData<EventoResponse>(
        queryKeys.eventi.detail(idEvento),
        (old) => {
          if (!old) return old
          return {
            ...old,
            ...(body.tot_ospiti != null       ? { tot_ospiti: body.tot_ospiti }             : {}),
            ...(body.perc_sedute_aper != null ? { perc_sedute_aper: body.perc_sedute_aper } : {}),
          }
        },
      )
      onSuccess?.()
    },
  })
}

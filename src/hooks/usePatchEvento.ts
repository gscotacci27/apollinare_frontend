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
            ...(body.stato            != null ? { stato: body.stato }                         : {}),
            ...(body.descrizione      != null ? { descrizione: body.descrizione }             : {}),
            ...(body.cliente          != null ? { cliente: body.cliente }                     : {}),
            ...(body.data             != null ? { data: body.data }                           : {}),
            ...(body.ora_evento       != null ? { ora_evento: body.ora_evento }               : {}),
            ...(body.id_location      != null ? { id_location: body.id_location }             : {}),
            ...(body.perc_sedute_aper != null ? { perc_sedute_aper: body.perc_sedute_aper }   : {}),
          }
        },
      )
      // Invalida la lista eventi (stato/date cambiano)
      qc.invalidateQueries({ queryKey: [...queryKeys.eventi.all, 'list'] })
      onSuccess?.()
    },
  })
}

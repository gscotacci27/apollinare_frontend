import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvento } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import type { EventoCreate } from '@/types/gestionale'
import toast from 'react-hot-toast'

export const useCreateEvento = (onSuccess?: (id: number) => void) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: EventoCreate) => createEvento(body),
    onSuccess: ({ id }) => {
      // Invalida tutte le varianti del filtro eventi
      qc.invalidateQueries({ queryKey: queryKeys.eventi.all })
      toast.success('Evento creato')
      onSuccess?.(id)
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : 'Errore nella creazione dell\'evento'
      toast.error(msg)
    },
  })
}

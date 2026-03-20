import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLocation } from '@/services/gestionale'
import { queryKeys } from '@/services/queryKeys'
import type { LocationItem } from '@/types/gestionale'

export const useCreateLocation = (onSuccess?: (loc: LocationItem) => void) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => createLocation(name),
    onSuccess: (loc) => {
      // Aggiunge la nuova location in cima alla cache esistente (no refetch completo)
      qc.setQueryData<LocationItem[]>(queryKeys.lookup.location, (old = []) => [
        ...old,
        loc,
      ].sort((a, b) => a.location.localeCompare(b.location)))
      onSuccess?.(loc)
    },
  })
}

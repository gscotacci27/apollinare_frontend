import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rejectEmail } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import type { Email } from '@/types/email'
import toast from 'react-hot-toast'

export const useRejectEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ request_id, reason }: { request_id: string; reason: string }) =>
      rejectEmail(request_id, reason),

    onMutate: async ({ request_id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.emails.pending() })
      const previous = queryClient.getQueryData<Email[]>(queryKeys.emails.pending())
      queryClient.setQueryData<Email[]>(queryKeys.emails.pending(), (old) =>
        old?.filter((e) => e.request_id !== request_id) ?? [],
      )
      return { previous }
    },

    onSuccess: () => {
      toast('Email rejected', { icon: '⚠️' })
    },

    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKeys.emails.pending(), ctx?.previous)
      toast.error('Something went wrong, please try again')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.pending() })
    },
  })
}

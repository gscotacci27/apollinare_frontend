import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendEmail } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'
import type { Email } from '@/types/email'
import toast from 'react-hot-toast'

export const useSendEmail = (onSuccess?: (request_id: string) => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ request_id, body }: { request_id: string; body: string }) =>
      sendEmail(request_id, body),

    onMutate: async ({ request_id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.emails.pending() })
      const previous = queryClient.getQueryData<Email[]>(queryKeys.emails.pending())
      queryClient.setQueryData<Email[]>(queryKeys.emails.pending(), (old) =>
        old?.filter((e) => e.request_id !== request_id) ?? [],
      )
      return { previous }
    },

    onSuccess: (_data, { request_id }) => {
      toast.success('Email sent successfully')
      onSuccess?.(request_id)
    },

    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(queryKeys.emails.pending(), ctx?.previous)
      toast.error('Failed to send email, please try again')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.pending() })
    },
  })
}

import { useMutation } from '@tanstack/react-query'
import { generateResponse } from '@/services/api'
import toast from 'react-hot-toast'

export const useGenerateResponse = (onSuccess: (draft: string) => void) => {
  return useMutation({
    mutationFn: (request_id: string) => generateResponse(request_id),
    onSuccess,
    onError: () => {
      toast.error('Failed to generate response, please try again')
    },
  })
}

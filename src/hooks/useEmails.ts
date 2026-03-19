import { useQuery } from '@tanstack/react-query'
import { getPendingEmails } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'

export const useEmails = () => {
  return useQuery({
    queryKey: queryKeys.emails.pending(),
    queryFn: getPendingEmails,
    refetchInterval: 30_000,
  })
}

import { useQuery } from '@tanstack/react-query'
import { getEmailById } from '@/services/api'
import { queryKeys } from '@/services/queryKeys'

export const useEmailDetail = (request_id: string | null) => {
  return useQuery({
    queryKey: queryKeys.emails.detail(request_id ?? ''),
    queryFn: () => getEmailById(request_id!),
    enabled: !!request_id,
    staleTime: 60_000,
  })
}

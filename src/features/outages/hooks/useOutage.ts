/**
 * useOutage Hook
 * React Query hook for fetching a single outage
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getOutageById } from '../api/outages'

export const useOutage = (outageId: string) => {
  return useQuery({
    queryKey: queryKeys.outages.detail(outageId),
    queryFn: () => getOutageById(outageId),
    enabled: !!outageId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


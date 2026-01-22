/**
 * useOfficeQueueStatistics Hook
 * React Query hook for fetching office queue statistics
 * Backend determines office from logged-in user's token
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getOfficeQueueStatistics } from '../api/ticket'

export const useOfficeQueueStatistics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.stats(), 'office-queue', 'my-office'],
    queryFn: () => getOfficeQueueStatistics(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


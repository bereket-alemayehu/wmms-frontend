/**
 * useOfficeQueueStatistics Hook
 * React Query hook for fetching office queue statistics
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getOfficeQueueStatistics } from '../api/ticket'

export const useOfficeQueueStatistics = (officeId?: string) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.stats(), 'office-queue', officeId],
    queryFn: () => getOfficeQueueStatistics(officeId!),
    enabled: !!officeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


/**
 * useSystemAnalytics Hook
 * React Query hook for fetching system-wide analytics
 * Access: Manager only
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getSystemAnalytics } from '../api/ticket'

export const useSystemAnalytics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tickets.statistics('system'),
    queryFn: () => getSystemAnalytics(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}




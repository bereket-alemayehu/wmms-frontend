/**
 * useTechnicianStatistics Hook
 * React Query hook for fetching technician statistics
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getTechnicianStatistics } from '../api/ticket'

export const useTechnicianStatistics = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tickets.statistics('technician'),
    queryFn: () => getTechnicianStatistics(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


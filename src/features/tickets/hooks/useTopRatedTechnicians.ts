/**
 * useTopRatedTechnicians Hook
 * React Query hook for fetching top-rated technicians
 * Access: Manager only
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getTopRatedTechnicians } from '../api/ticket'

export const useTopRatedTechnicians = (limit: number = 3, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tickets.statistics('top-rated-technicians'),
    queryFn: () => getTopRatedTechnicians(limit),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}


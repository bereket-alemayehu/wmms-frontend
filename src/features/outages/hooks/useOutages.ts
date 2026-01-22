/**
 * useOutages Hook
 * React Query hook for fetching outages list
 * Access: All authenticated users
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getAllOutages } from '../api/outages'

export const useOutages = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.outages.lists(),
    queryFn: () => getAllOutages(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


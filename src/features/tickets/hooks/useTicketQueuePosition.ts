/**
 * useTicketQueuePosition Hook
 * React Query hook for fetching ticket queue position
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getTicketQueuePosition } from '../api/ticket'

export const useTicketQueuePosition = (ticketId: string) => {
  return useQuery({
    queryKey: [...queryKeys.tickets.detail(ticketId), 'queue-position'],
    queryFn: () => getTicketQueuePosition(ticketId),
    enabled: !!ticketId,
    staleTime: 1000 * 60, // 1 minute
  })
}


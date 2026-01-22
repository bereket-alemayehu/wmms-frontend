/**
 * useTicket Hook
 * React Query hook for fetching a single ticket
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getTicketById } from '../api/ticket'

export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => getTicketById(ticketId),
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


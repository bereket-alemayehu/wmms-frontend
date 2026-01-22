/**
 * useRefundEligibility Hook
 * React Query hook for checking ticket refund eligibility
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { checkRefundEligibility } from '../api/ticket'

export const useRefundEligibility = (ticketId: string) => {
  return useQuery({
    queryKey: [...queryKeys.tickets.detail(ticketId), 'refund-eligibility'],
    queryFn: () => checkRefundEligibility(ticketId),
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}


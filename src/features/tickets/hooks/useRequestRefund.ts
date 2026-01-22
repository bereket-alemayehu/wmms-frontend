/**
 * useRequestRefund Hook
 * React Query mutation hook for requesting refunds
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { requestRefund } from '../api/ticket'
import { toast } from 'sonner'

export const useRequestRefund = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => requestRefund(ticketId),
    onSuccess: (_, ticketId) => {
      // Invalidate the specific ticket
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) })
      // Invalidate all ticket lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() })
      // Invalidate refunds queries
      queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all })
      
      toast.success('Refund requested successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to request refund'
      toast.error(message)
    },
  })
}


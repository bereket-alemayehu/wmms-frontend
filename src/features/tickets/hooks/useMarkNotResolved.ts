/**
 * useMarkNotResolved Hook
 * React Query mutation hook for customers to mark tickets as not resolved
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { markTicketNotResolved } from '../api/ticket'
import { toast } from 'sonner'

export const useMarkNotResolved = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => markTicketNotResolved(ticketId),
    onSuccess: (_, ticketId) => {
      // Invalidate the specific ticket
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) })
      // Invalidate all ticket lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      
      toast.success('Ticket marked as not resolved. Status changed to "In Progress".')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to mark ticket as not resolved'
      toast.error(message)
    },
  })
}


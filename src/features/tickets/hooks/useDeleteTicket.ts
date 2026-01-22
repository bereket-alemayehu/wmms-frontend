/**
 * useDeleteTicket Hook
 * React Query mutation hook for deleting tickets
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { deleteTicket } from '../api/ticket'
import { toast } from 'sonner'

export const useDeleteTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => deleteTicket(ticketId),
    onSuccess: () => {
      // Invalidate all ticket queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      
      toast.success('Ticket deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete ticket'
      toast.error(message)
    },
  })
}


/**
 * useConfirmResolution Hook
 * React Query mutation hook for customers to confirm ticket resolution
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { confirmTicketResolution } from '../api/ticket'
import { toast } from 'sonner'

export const useConfirmResolution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => confirmTicketResolution(ticketId),
    onSuccess: (_, ticketId) => {
      // Invalidate the specific ticket
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(ticketId) })
      // Invalidate all ticket lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      
      toast.success('Ticket resolution confirmed! Ticket is now closed.')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to confirm resolution'
      toast.error(message)
    },
  })
}






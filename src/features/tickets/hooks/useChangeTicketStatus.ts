/**
 * useChangeTicketStatus Hook
 * React Query mutation hook for changing ticket status
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { changeTicketStatus } from '../api/ticket'
import { toast } from 'sonner'

export const useChangeTicketStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      ticketId, 
      status, 
      assignedTo 
    }: { 
      ticketId: string
      status: string
      assignedTo?: string 
    }) => changeTicketStatus(ticketId, status, assignedTo),
    onSuccess: (_, variables) => {
      // Invalidate the specific ticket
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.ticketId) })
      // Invalidate all ticket lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      
      toast.success('Ticket status updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update ticket status'
      toast.error(message)
    },
  })
}


/**
 * useAssignTicket Hook
 * React Query mutation hook for assigning tickets to technicians
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { assignTicket } from '../api/ticket'
import type { AssignTicketRequest } from '../types'
import { toast } from 'sonner'

export const useAssignTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: AssignTicketRequest }) => 
      assignTicket(ticketId, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific ticket
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.ticketId) })
      // Invalidate all ticket lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      
      toast.success('Ticket assigned successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to assign ticket'
      toast.error(message)
    },
  })
}


/**
 * useUpdateTicket Hook
 * React Query mutation hook for updating tickets
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { updateTicket } from '../api/ticket'
import type { UpdateTicketRequest } from '../types'
import { toast } from 'sonner'

export const useUpdateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketRequest }) => 
      updateTicket(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific ticket
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.id) })
      // Invalidate all ticket lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      
      toast.success('Ticket updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update ticket'
      toast.error(message)
    },
  })
}


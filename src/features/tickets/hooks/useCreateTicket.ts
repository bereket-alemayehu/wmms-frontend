/**
 * useCreateTicket Hook
 * React Query mutation hook for creating tickets
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { createTicket } from '../api/ticket'
import type { CreateTicketRequest } from '../types'
import { toast } from 'sonner'

export const useCreateTicket = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => createTicket(data),
    onSuccess: () => {
      // Invalidate all ticket queries to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
      // Also invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() })
      
      toast.success('Ticket created successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create ticket'
      toast.error(message)
    },
  })
}


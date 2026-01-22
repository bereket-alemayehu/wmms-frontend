/**
 * useSubmitFeedback Hook
 * React Query mutation hook for submitting ticket feedback
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { submitTicketFeedback } from '../api/ticket'
import { toast } from 'sonner'

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      ticketId, 
      rating, 
      feedbackComment 
    }: { 
      ticketId: string
      rating: number
      feedbackComment?: string 
    }) => submitTicketFeedback(ticketId, rating, feedbackComment),
    onSuccess: (_, variables) => {
      // Invalidate the specific ticket
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.ticketId) })
      // Invalidate all ticket lists
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() })
      
      toast.success('Feedback submitted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit feedback'
      toast.error(message)
    },
  })
}


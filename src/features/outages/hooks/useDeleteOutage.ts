/**
 * useDeleteOutage Hook
 * React Query mutation hook for deleting outages
 * Access: Manager only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { deleteOutage } from '../api/outages'
import { toast } from 'sonner'

export const useDeleteOutage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteOutage(id),
    onSuccess: () => {
      // Invalidate all outages lists
      queryClient.invalidateQueries({ queryKey: queryKeys.outages.lists() })
      
      toast.success('Outage deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete outage'
      toast.error(message)
    },
  })
}


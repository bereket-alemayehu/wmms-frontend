/**
 * useUpdateOutage Hook
 * React Query mutation hook for updating outages
 * Access: Supervisor and Manager only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { updateOutage } from '../api/outages'
import type { UpdateOutageRequest } from '../api/outages'
import { toast } from 'sonner'

export const useUpdateOutage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOutageRequest }) => 
      updateOutage(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific outage
      queryClient.invalidateQueries({ queryKey: queryKeys.outages.detail(variables.id) })
      // Invalidate all outages lists
      queryClient.invalidateQueries({ queryKey: queryKeys.outages.lists() })
      
      toast.success('Outage updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update outage'
      toast.error(message)
    },
  })
}


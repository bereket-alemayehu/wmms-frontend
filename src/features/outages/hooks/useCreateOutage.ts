/**
 * useCreateOutage Hook
 * React Query mutation hook for creating outages
 * Access: Supervisor and Manager only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { createOutage } from '../api/outages'
import type { CreateOutageRequest } from '../api/outages'
import { toast } from 'sonner'

export const useCreateOutage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOutageRequest) => createOutage(data),
    onSuccess: () => {
      // Invalidate outages list
      queryClient.invalidateQueries({ queryKey: queryKeys.outages.lists() })
      
      toast.success('Outage created successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create outage'
      toast.error(message)
    },
  })
}


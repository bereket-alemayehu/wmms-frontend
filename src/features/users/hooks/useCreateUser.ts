/**
 * useCreateUser Hook
 * React Query mutation hook for creating new users (Technicians/Supervisors)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { userapi } from '../api/user'
import { toast } from 'sonner'

export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: any) => {
            try {
                const response = await userapi.createUser(data)
                if (response.status === 'error') {
                    throw new Error(response.message || 'Failed to create user')
                }
                return response.data?.document
            } catch (error: any) {
                const message = error.response?.data?.message || error.message || 'Failed to create user'
                throw new Error(message)
            }
        },
        onSuccess: (newUser) => {
            // Invalidate user lists based on the role of the new user
            if (newUser?.role) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.users.list({ role: newUser.role })
                })
            }
            // Also invalidate all user lists just in case
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all })

            toast.success('User created successfully!')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Failed to create user'
            toast.error(message)
        },
    })
}

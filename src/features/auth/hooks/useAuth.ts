import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { authApi } from '../api/auth'

export { useAuth } from '../contexts/auth-context'

/**
 * Hook for fetching customers assigned to an office
 * Role restriction: manager, technician
 */
export const useCustomersByOffice = (officeId?: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.users.list({ role: 'customer', officeId }),
        queryFn: async () => {
            const response = await authApi.getCustomersByOffice(officeId)
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to fetch customers')
            }
            return response.data?.customers || []
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook for fetching technicians assigned to an office
 * Role restriction: manager, supervisor
 */
export const useTechniciansByOffice = (officeId?: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.users.list({ role: 'technician', officeId }),
        queryFn: async () => {
            const response = await authApi.getTechniciansByOffice(officeId)
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to fetch technicians')
            }
            return response.data?.technicians || []
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook for fetching supervisors assigned to an office
 * Role restriction: manager
 */
export const useSupervisorsByOffice = (officeId?: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.users.list({ role: 'supervisor', officeId }),
        queryFn: async () => {
            const response = await authApi.getSupervisorsByOffice(officeId)
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to fetch supervisors')
            }
            return response.data?.supervisors || []
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}




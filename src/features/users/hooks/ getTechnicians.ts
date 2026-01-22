  import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {userapi} from '../api/user'

/**
 * Hook for fetching technicians assigned to an office
 * Role restriction: manager, supervisor
 */
export const useTechniciansByOffice = (officeId?: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.users.list({ role: 'technician', officeId }),
        queryFn: async () => {
            const response = await userapi.getTechniciansByOffice(officeId)
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to fetch technicians')
            }
            return response.data?.technicians || []
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

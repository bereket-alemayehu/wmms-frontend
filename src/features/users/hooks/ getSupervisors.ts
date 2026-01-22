  import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {userapi} from '../api/user'
 
/**
 * Hook for fetching supervisors assigned to an office
 * Role restriction: manager
 */
export const useSupervisorsByOffice = (officeId?: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.users.list({ role: 'supervisor', officeId }),
        queryFn: async () => {
            const response = await userapi.getSupervisorsByOffice(officeId)
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to fetch supervisors')
            }
            return response.data?.supervisors || []
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

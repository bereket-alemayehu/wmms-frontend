
  import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {userapi} from '../api/user'



/**
 * Hook for fetching customers assigned to an office
 * Role restriction: manager, technician
 */
export const useCustomersByOffice = (officeId?: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.users.list({ role: 'customer', officeId }),
        queryFn: async () => {
            const response = await userapi.getCustomersByOffice(officeId)
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to fetch customers')
            }
            return response.data?.customers || []
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
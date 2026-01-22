/**
 * useTickets Hook
 * React Query hook for fetching tickets list
 * NOTE: Backend has specific routes based on user role (handled by auth token)
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { 
  getAllTickets, 
  getTicketsByCustomer, 
  getTicketsByTechnician, 
  getTicketsByOffice 
} from '../api/ticket'
import type { TicketFilters } from '../types'

export const useTickets = (filters?: TicketFilters) => {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters || {}),
    queryFn: () => getAllTickets(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook for fetching customer's own tickets
 * Uses backend route: GET /tickets/customer/my-tickets
 */
export const useCustomerTickets = () => {
  return useQuery({
    queryKey: queryKeys.tickets.list({ customer: 'me' }),
    queryFn: () => getTicketsByCustomer(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook for fetching technician's assigned tickets
 * Uses backend route: GET /tickets/technician/my-tickets
 */
export const useTechnicianTickets = (status?: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.list({ technician: 'me', status }),
    queryFn: () => getTicketsByTechnician(status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook for fetching office tickets
 * Uses backend route: GET /tickets/office/:officeId/tickets
 */
export const useOfficeTickets = (officeId?: string, status?: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.list({ officeId, status }),
    queryFn: () => getTicketsByOffice(officeId!, status),
    enabled: !!officeId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


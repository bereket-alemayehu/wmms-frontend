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

export const useTickets = (filters?: TicketFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tickets.list((filters || {}) as Record<string, unknown>),
    queryFn: () => getAllTickets(filters),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook for fetching customer's own tickets
 * Uses backend route: GET /tickets/customer/my-tickets
 */
export const useCustomerTickets = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tickets.list({ customer: 'me' }),
    queryFn: () => getTicketsByCustomer(),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook for fetching technician's assigned tickets
 * Uses backend route: GET /tickets/technician/my-tickets
 */
export const useTechnicianTickets = (status?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tickets.list({ technician: 'me', status }),
    queryFn: () => getTicketsByTechnician(status),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook for fetching office tickets
 * Uses backend route: GET /tickets/office/tickets
 * Backend determines office from logged-in user's token
 */
export const useOfficeTickets = (status?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.tickets.list({ office: 'my-office', status }),
    queryFn: () => getTicketsByOffice(status),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}


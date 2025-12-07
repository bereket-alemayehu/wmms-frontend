import apiClient from '@/lib/axios'
import type { Ticket, Outage } from '../types'

export interface DashboardStats {
  openTickets: number
  resolvedTickets: number
  activeOutages: number
  pendingRefunds: number
  totalRefundAmount: number
  resolutionRate: number
}

export const dashboardApi = {
  getStats: async (role: string): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>(`/dashboard/stats?role=${role}`)
    return response.data
  },

  getTickets: async (role: string, filters?: Record<string, any>): Promise<Ticket[]> => {
    const response = await apiClient.get<Ticket[]>('/dashboard/tickets', { params: { role, ...filters } })
    return response.data
  },

  getOutages: async (officeId?: string): Promise<Outage[]> => {
    const response = await apiClient.get<Outage[]>('/dashboard/outages', { params: { officeId } })
    return response.data
  },
}


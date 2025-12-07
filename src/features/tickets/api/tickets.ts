import apiClient from '@/lib/axios'
import type { Ticket, TicketCategory } from '../types'

export interface CreateTicketRequest {
  category: TicketCategory
  description: string
  officeId: string
}

export const ticketsApi = {
  getAll: async (filters?: Record<string, any>): Promise<Ticket[]> => {
    const response = await apiClient.get<Ticket[]>('/tickets', { params: filters })
    return response.data
  },

  getById: async (id: string): Promise<Ticket> => {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`)
    return response.data
  },

  create: async (data: CreateTicketRequest): Promise<Ticket> => {
    const response = await apiClient.post<Ticket>('/tickets', data)
    return response.data
  },

  update: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    const response = await apiClient.patch<Ticket>(`/tickets/${id}`, data)
    return response.data
  },

  assign: async (id: string, technicianId: string): Promise<Ticket> => {
    const response = await apiClient.post<Ticket>(`/tickets/${id}/assign`, { technicianId })
    return response.data
  },

  requestRefund: async (id: string): Promise<Ticket> => {
    const response = await apiClient.post<Ticket>(`/tickets/${id}/request-refund`)
    return response.data
  },
}


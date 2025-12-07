import apiClient from '@/lib/axios'
import type { Outage } from '../types'

export interface CreateOutageRequest {
  officeId: string
  title: string
  message: string
  affectedAreas: string[]
  estimatedResolution?: string
}

export const outagesApi = {
  getAll: async (officeId?: string): Promise<Outage[]> => {
    const response = await apiClient.get<Outage[]>('/outages', { params: { officeId } })
    return response.data
  },

  getById: async (id: string): Promise<Outage> => {
    const response = await apiClient.get<Outage>(`/outages/${id}`)
    return response.data
  },

  create: async (data: CreateOutageRequest): Promise<Outage> => {
    const response = await apiClient.post<Outage>('/outages', data)
    return response.data
  },

  update: async (id: string, data: Partial<Outage>): Promise<Outage> => {
    const response = await apiClient.patch<Outage>(`/outages/${id}`, data)
    return response.data
  },

  resolve: async (id: string): Promise<Outage> => {
    const response = await apiClient.post<Outage>(`/outages/${id}/resolve`)
    return response.data
  },
}


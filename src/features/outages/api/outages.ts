/**
 * Outage API
 * All backend interactions for the outage feature
 * Uses centralized axios client with cookie-based authentication
 */

import apiClient from '@/lib/axios'
import type { Outage } from '../types'

export interface CreateOutageRequest {
  title: string
  message: string
  affectedAreas: string[]
  estimatedResolution?: string
  // Note: officeId and postedBy are automatically set by backend from authenticated user
}

export interface UpdateOutageRequest {
  title?: string
  message?: string
  affectedAreas?: string[]
  status?: 'Active' | 'Resolved'
  estimatedResolution?: string
}

/**
 * Get all outages
 * Backend: GET /outages
 * Access: All authenticated users
 */
export const getAllOutages = async (): Promise<Outage[]> => {
  const response = await apiClient.get<{ 
    status: string
    results: number
    data: { documents: Outage[] }
  }>('/outages')
  return response.data.data.documents
}

/**
 * Get a single outage by ID
 * Backend: GET /outages/:id
 * Access: All authenticated users
 */
export const getOutageById = async (id: string): Promise<Outage> => {
  const response = await apiClient.get<{ 
    status: string
    data: { document: Outage }
  }>(`/outages/${id}`)
  return response.data.data.document
}

/**
 * Create a new outage
 * Backend: POST /outages
 * Access: Supervisor and Manager only
 */
export const createOutage = async (data: CreateOutageRequest): Promise<Outage> => {
  const response = await apiClient.post<{ 
    status: string
    data: { document: Outage }
  }>('/outages', data)
  return response.data.data.document
}

/**
 * Update an existing outage
 * Backend: PATCH /outages/:id
 * Access: Supervisor and Manager only
 */
export const updateOutage = async (id: string, data: UpdateOutageRequest): Promise<Outage> => {
  const response = await apiClient.patch<{ 
    status: string
    data: { document: Outage }
  }>(`/outages/${id}`, data)
  return response.data.data.document
}

/**
 * Delete an outage
 * Backend: DELETE /outages/:id
 * Access: Manager only
 */
export const deleteOutage = async (id: string): Promise<void> => {
  await apiClient.delete(`/outages/${id}`)
}


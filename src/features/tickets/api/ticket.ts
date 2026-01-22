/**
 * Ticket API
 * All backend interactions for the ticket feature
 * Uses centralized axios client with cookie-based authentication
 */

import apiClient from '@/lib/axios'
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  AssignTicketRequest,
  TicketFilters,
} from '../types'

/**
 * Get all tickets with optional filters
 */
export const getAllTickets = async (filters?: TicketFilters): Promise<Ticket[]> => {
  const response = await apiClient.get<{ status: string; data: { tickets: Ticket[] } }>(
    '/tickets',
    { params: filters }
  )
  return response.data.data.tickets
}

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (id: string): Promise<Ticket> => {
  const response = await apiClient.get<{ status: string; data: { document: Ticket } }>(
    `/tickets/${id}`
  )
  return response.data.data.document
}

/**
 * Create a new ticket
 * Backend returns "document" not "ticket"
 */
export const createTicket = async (data: CreateTicketRequest): Promise<Ticket> => {
  const response = await apiClient.post<{ status: string; data: { document: Ticket } }>(
    '/tickets',
    data
  )
  return response.data.data.document
}

/**
 * Update an existing ticket
 */
export const updateTicket = async (id: string, data: UpdateTicketRequest): Promise<Ticket> => {
  const response = await apiClient.patch<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}`,
    data
  )
  return response.data.data.ticket
}

/**
 * Delete a ticket
 */
export const deleteTicket = async (id: string): Promise<void> => {
  await apiClient.delete(`/tickets/${id}`)
}

/**
 * Assign a ticket to a technician
 * Backend: PATCH /tickets/:id/assign
 */
export const assignTicket = async (id: string, data: AssignTicketRequest): Promise<Ticket> => {
  const response = await apiClient.patch<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/assign`,
    data
  )
  return response.data.data.ticket
}

/**
 * Request a refund for a ticket
 */
export const requestRefund = async (id: string): Promise<Ticket> => {
  const response = await apiClient.post<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/request-refund`,
    {}
  )
  return response.data.data.ticket
}

/**
 * Confirm ticket resolution (Customer closes resolved ticket)
 * Backend: POST /tickets/:id/confirm-resolution
 */
export const confirmTicketResolution = async (id: string): Promise<Ticket> => {
  const response = await apiClient.post<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/confirm-resolution`,
    {}
  )
  return response.data.data.ticket
}

/**
 * Mark ticket as not resolved (Customer changes status back to In Progress)
 * Backend: POST /tickets/:id/not-resolved
 */
export const markTicketNotResolved = async (id: string): Promise<Ticket> => {
  const response = await apiClient.post<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/not-resolved`,
    {}
  )
  return response.data.data.ticket
}

/**
 * Get tickets by office
 * Backend: GET /tickets/office/tickets
 * Note: Backend automatically determines office from logged-in user's token
 */
export const getTicketsByOffice = async (status?: string): Promise<Ticket[]> => {
  const response = await apiClient.get<{ status: string; results: number; data: { tickets: Ticket[] } }>(
    `/tickets/office/tickets`,
    { params: status ? { status } : {} }
  )
  return response.data.data.tickets
}

/**
 * Get tickets by customer
 * Backend: GET /tickets/customer/my-tickets
 */
export const getTicketsByCustomer = async (): Promise<Ticket[]> => {
  const response = await apiClient.get<{ status: string; results: number; data: { tickets: Ticket[] } }>(
    `/tickets/customer/my-tickets`
  )
  return response.data.data.tickets
}

/**
 * Get tickets assigned to a technician
 * Backend: GET /tickets/technician/my-tickets
 */
export const getTicketsByTechnician = async (status?: string): Promise<Ticket[]> => {
  const response = await apiClient.get<{ status: string; results: number; data: { tickets: Ticket[] } }>(
    `/tickets/technician/my-tickets`,
    { params: status ? { status } : {} }
  )
  return response.data.data.tickets
}

/**
 * Change ticket status
 * Backend: PATCH /tickets/:id/status
 */
export const changeTicketStatus = async (
  id: string, 
  status: string, 
  assignedTo?: string
): Promise<Ticket> => {
  const response = await apiClient.patch<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/status`,
    { status, assignedTo }
  )
  return response.data.data.ticket
}

/**
 * Submit ticket feedback
 * Backend: POST /tickets/:id/feedback
 */
export const submitTicketFeedback = async (
  id: string,
  rating: number,
  feedbackComment?: string
): Promise<Ticket> => {
  const response = await apiClient.post<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/feedback`,
    { rating, feedbackComment }
  )
  return response.data.data.ticket
}

/**
 * Get ticket queue position
 * Backend: GET /tickets/:id/queue-position
 */
export const getTicketQueuePosition = async (id: string): Promise<{ queuePosition: number }> => {
  const response = await apiClient.get<{ 
    status: string; 
    data: { ticketId: string; queuePosition: number } 
  }>(
    `/tickets/${id}/queue-position`
  )
  return { queuePosition: response.data.data.queuePosition }
}

/**
 * Check ticket refund eligibility
 * Backend: GET /tickets/:id/refund-eligibility
 */
export const checkRefundEligibility = async (id: string): Promise<{
  refundEligible: boolean;
  refundRequested: boolean;
}> => {
  const response = await apiClient.get<{ 
    status: string; 
    data: { 
      ticketId: string; 
      refundEligible: boolean; 
      refundRequested: boolean 
    } 
  }>(
    `/tickets/${id}/refund-eligibility`
  )
  return {
    refundEligible: response.data.data.refundEligible,
    refundRequested: response.data.data.refundRequested,
  }
}

/**
 * Get office queue statistics
 * Backend: GET /tickets/office/statistics
 * Note: Backend automatically determines office from logged-in user's token
 */
export const getOfficeQueueStatistics = async (): Promise<any> => {
  const response = await apiClient.get<{ status: string; data: { statistics: any } }>(
    `/tickets/office/statistics`
  )
  return response.data.data.statistics
}


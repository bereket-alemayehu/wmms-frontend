/**
 * Ticket API
 * All backend interactions for the ticket feature
 * IMPORTANT: Uses hardcoded Bearer token for isolated testing
 */

import axios from 'axios'
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  AssignTicketRequest,
  TicketFilters,
} from '../types'

// Hardcoded Bearer token for testing in isolation
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmZlZDMxYmI3NjI1MTgzNzY2YWNjNCIsImlhdCI6MTc2OTA2NzAwOSwiZXhwIjoxNzY5MDc0Nzg1fQ.NuOcQfosDXCf5C3jZc_k6OjflTeqwqK3l4ttrdMrEyM'

// API base URL - Backend running on port 3002
const API_BASE_URL = 'http://localhost:3002/api/v1'

// Axios instance specifically for tickets
const ticketApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Get all tickets with optional filters
 */
export const getAllTickets = async (filters?: TicketFilters): Promise<Ticket[]> => {
  const response = await ticketApiClient.get<{ status: string; data: { tickets: Ticket[] } }>(
    '/tickets',
    {
      params: filters,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.tickets
}

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (id: string): Promise<Ticket> => {
  const response = await ticketApiClient.get<{ status: string; data: { document: Ticket } }>(
    `/tickets/${id}`,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.document
}

/**
 * Create a new ticket
 * Backend returns "document" not "ticket"
 */
export const createTicket = async (data: CreateTicketRequest): Promise<Ticket> => {
  const response = await ticketApiClient.post<{ status: string; data: { document: Ticket } }>(
    '/tickets',
    data,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.document
}

/**
 * Update an existing ticket
 */
export const updateTicket = async (id: string, data: UpdateTicketRequest): Promise<Ticket> => {
  const response = await ticketApiClient.patch<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.ticket
}

/**
 * Delete a ticket
 */
export const deleteTicket = async (id: string): Promise<void> => {
  await ticketApiClient.delete(`/tickets/${id}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  })
}

/**
 * Assign a ticket to a technician
 * Backend: PATCH /tickets/:id/assign
 */
export const assignTicket = async (id: string, data: AssignTicketRequest): Promise<Ticket> => {
  const response = await ticketApiClient.patch<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/assign`,
    data,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.ticket
}

/**
 * Request a refund for a ticket
 */
export const requestRefund = async (id: string): Promise<Ticket> => {
  const response = await ticketApiClient.post<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/request-refund`,
    {},
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.ticket
}

/**
 * Get tickets by office
 * Backend: GET /tickets/office/:officeId/tickets
 */
export const getTicketsByOffice = async (officeId: string, status?: string): Promise<Ticket[]> => {
  const response = await ticketApiClient.get<{ status: string; results: number; data: { tickets: Ticket[] } }>(
    `/tickets/office/${officeId}/tickets`,
    {
      params: status ? { status } : {},
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.tickets
}

/**
 * Get tickets by customer
 * Backend: GET /tickets/customer/my-tickets
 */
export const getTicketsByCustomer = async (): Promise<Ticket[]> => {
  const response = await ticketApiClient.get<{ status: string; results: number; data: { tickets: Ticket[] } }>(
    `/tickets/customer/my-tickets`,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.tickets
}

/**
 * Get tickets assigned to a technician
 * Backend: GET /tickets/technician/my-tickets
 */
export const getTicketsByTechnician = async (status?: string): Promise<Ticket[]> => {
  const response = await ticketApiClient.get<{ status: string; results: number; data: { tickets: Ticket[] } }>(
    `/tickets/technician/my-tickets`,
    {
      params: status ? { status } : {},
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
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
  const response = await ticketApiClient.patch<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/status`,
    { status, assignedTo },
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
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
  const response = await ticketApiClient.post<{ status: string; data: { ticket: Ticket } }>(
    `/tickets/${id}/feedback`,
    { rating, feedbackComment },
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.ticket
}

/**
 * Get ticket queue position
 * Backend: GET /tickets/:id/queue-position
 */
export const getTicketQueuePosition = async (id: string): Promise<{ queuePosition: number }> => {
  const response = await ticketApiClient.get<{ 
    status: string; 
    data: { ticketId: string; queuePosition: number } 
  }>(
    `/tickets/${id}/queue-position`,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
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
  const response = await ticketApiClient.get<{ 
    status: string; 
    data: { 
      ticketId: string; 
      refundEligible: boolean; 
      refundRequested: boolean 
    } 
  }>(
    `/tickets/${id}/refund-eligibility`,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return {
    refundEligible: response.data.data.refundEligible,
    refundRequested: response.data.data.refundRequested,
  }
}

/**
 * Get office queue statistics
 * Backend: GET /tickets/office/:officeId/statistics
 */
export const getOfficeQueueStatistics = async (officeId: string): Promise<any> => {
  const response = await ticketApiClient.get<{ status: string; data: { statistics: any } }>(
    `/tickets/office/${officeId}/statistics`,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    }
  )
  return response.data.data.statistics
}


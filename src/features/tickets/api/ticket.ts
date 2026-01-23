/**
 * Ticket API
 * All backend interactions for the ticket feature
 * Uses centralized axios client with cookie-based authentication
 */

import apiClient from "@/lib/axios";
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  AssignTicketRequest,
  TicketFilters,
} from "../types";

type RawTicket = any;

const normalizeTicket = (raw: RawTicket): Ticket => {
  const customerObj =
    raw?.customerId && typeof raw.customerId === "object"
      ? raw.customerId
      : raw?.customer;
  const officeObj =
    raw?.officeId && typeof raw.officeId === "object"
      ? raw.officeId
      : raw?.office;
  const technicianObj =
    raw?.assignedTo && typeof raw.assignedTo === "object"
      ? raw.assignedTo
      : raw?.technician;

  return {
    ...raw,
    customerId:
      typeof raw?.customerId === "object"
        ? raw.customerId?._id
        : raw?.customerId,
    officeId:
      typeof raw?.officeId === "object" ? raw.officeId?._id : raw?.officeId,
    assignedTo:
      typeof raw?.assignedTo === "object"
        ? raw.assignedTo?._id
        : raw?.assignedTo,
    customer: customerObj,
    office: officeObj,
    technician: technicianObj,
  };
};

const unwrapTicket = (data: any): Ticket => {
  const raw = data?.ticket ?? data?.document ?? data?.data ?? data;
  return normalizeTicket(raw);
};

/**
 * Get all tickets with optional filters
 */
export const getAllTickets = async (
  filters?: TicketFilters,
): Promise<Ticket[]> => {
  const response = await apiClient.get<{
    status: string;
    data: { tickets?: RawTicket[]; documents?: RawTicket[] };
  }>("/tickets", { params: filters });
  const list = response.data.data.tickets ?? response.data.data.documents ?? [];
  return list.map(normalizeTicket);
};

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (id: string): Promise<Ticket> => {
  const response = await apiClient.get<{
    status: string;
    data: { document?: RawTicket; ticket?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}`);
  return unwrapTicket(response.data.data);
};

/**
 * Create a new ticket
 * Backend returns "document" not "ticket"
 */
export const createTicket = async (
  data: CreateTicketRequest,
): Promise<Ticket> => {
  const response = await apiClient.post<{
    status: string;
    data: { document?: RawTicket; ticket?: RawTicket; data?: RawTicket };
  }>("/tickets", data);
  return unwrapTicket(response.data.data);
};

/**
 * Update an existing ticket
 */
export const updateTicket = async (
  id: string,
  data: UpdateTicketRequest,
): Promise<Ticket> => {
  const response = await apiClient.patch<{
    status: string;
    data: { ticket?: RawTicket; document?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}`, data);
  return unwrapTicket(response.data.data);
};

/**
 * Delete a ticket
 */
export const deleteTicket = async (id: string): Promise<void> => {
  await apiClient.delete(`/tickets/${id}`);
};

/**
 * Assign a ticket to a technician
 * Backend: PATCH /tickets/:id/assign
 */
export const assignTicket = async (
  id: string,
  data: AssignTicketRequest,
): Promise<Ticket> => {
  const response = await apiClient.patch<{
    status: string;
    data: { ticket?: RawTicket; document?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}/assign`, data);
  return unwrapTicket(response.data.data);
};

/**
 * Request a refund for a ticket
 */
export const requestRefund = async (id: string): Promise<Ticket> => {
  const response = await apiClient.post<{
    status: string;
    data: { ticket?: RawTicket; document?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}/request-refund`, {});
  return unwrapTicket(response.data.data);
};

/**
 * Confirm ticket resolution (Customer closes resolved ticket)
 * Backend: POST /tickets/:id/confirm-resolution
 */
export const confirmTicketResolution = async (id: string): Promise<Ticket> => {
  const response = await apiClient.post<{
    status: string;
    data: { ticket?: RawTicket; document?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}/confirm-resolution`, {});
  return unwrapTicket(response.data.data);
};

/**
 * Mark ticket as not resolved (Customer changes status back to In Progress)
 * Backend: POST /tickets/:id/not-resolved
 */
export const markTicketNotResolved = async (id: string): Promise<Ticket> => {
  const response = await apiClient.post<{
    status: string;
    data: { ticket?: RawTicket; document?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}/not-resolved`, {});
  return unwrapTicket(response.data.data);
};

/**
 * Get tickets by office
 * Backend: GET /tickets/office/tickets
 * Note: Backend automatically determines office from logged-in user's token
 */
export const getTicketsByOffice = async (
  status?: string,
): Promise<Ticket[]> => {
  const response = await apiClient.get<{
    status: string;
    results: number;
    data: { tickets: RawTicket[] };
  }>(`/tickets/office/tickets`, { params: status ? { status } : {} });
  return response.data.data.tickets.map(normalizeTicket);
};

/**
 * Get tickets by customer
 * Backend: GET /tickets/customer/my-tickets
 */
export const getTicketsByCustomer = async (): Promise<Ticket[]> => {
  const response = await apiClient.get<{
    status: string;
    results: number;
    data: { tickets: RawTicket[] };
  }>(`/tickets/customer/my-tickets`);
  return response.data.data.tickets.map(normalizeTicket);
};

/**
 * Get tickets assigned to a technician
 * Backend: GET /tickets/technician/my-tickets
 */
export const getTicketsByTechnician = async (
  status?: string,
): Promise<Ticket[]> => {
  const response = await apiClient.get<{
    status: string;
    results: number;
    data: { tickets: RawTicket[] };
  }>(`/tickets/technician/my-tickets`, { params: status ? { status } : {} });
  return response.data.data.tickets.map(normalizeTicket);
};

/**
 * Change ticket status
 * Backend: PATCH /tickets/:id/status
 */
export const changeTicketStatus = async (
  id: string,
  status: string,
  assignedTo?: string,
): Promise<Ticket> => {
  const response = await apiClient.patch<{
    status: string;
    data: { ticket?: RawTicket; document?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}/status`, { status, assignedTo });
  return unwrapTicket(response.data.data);
};

/**
 * Submit ticket feedback
 * Backend: POST /tickets/:id/feedback
 */
export const submitTicketFeedback = async (
  id: string,
  rating: number,
  feedbackComment?: string,
): Promise<Ticket> => {
  const response = await apiClient.post<{
    status: string;
    data: { ticket?: RawTicket; document?: RawTicket; data?: RawTicket };
  }>(`/tickets/${id}/feedback`, { rating, feedbackComment });
  return unwrapTicket(response.data.data);
};

/**
 * Get ticket queue position
 * Backend: GET /tickets/:id/queue-position
 */
export const getTicketQueuePosition = async (
  id: string,
): Promise<{ queuePosition: number }> => {
  const response = await apiClient.get<{
    status: string;
    data: { ticketId: string; queuePosition: number };
  }>(`/tickets/${id}/queue-position`);
  return { queuePosition: response.data.data.queuePosition };
};

/**
 * Check ticket refund eligibility
 * Backend: GET /tickets/:id/refund-eligibility
 */
export const checkRefundEligibility = async (
  id: string,
): Promise<{
  refundEligible: boolean;
  refundRequested: boolean;
}> => {
  const response = await apiClient.get<{
    status: string;
    data: {
      ticketId: string;
      refundEligible: boolean;
      refundRequested: boolean;
    };
  }>(`/tickets/${id}/refund-eligibility`);
  return {
    refundEligible: response.data.data.refundEligible,
    refundRequested: response.data.data.refundRequested,
  };
};

/**
 * Get office queue statistics
 * Backend: GET /tickets/office/statistics
 * Note: Backend automatically determines office from logged-in user's token
 */
export const getOfficeQueueStatistics = async (): Promise<any> => {
  const response = await apiClient.get<{
    status: string;
    data: { statistics: any };
  }>(`/tickets/office/statistics`);
  return response.data.data.statistics;
};

/**
 * Get technician statistics
 * Backend: GET /tickets/technician/statistics
 * Note: Backend automatically determines technician from logged-in user's token
 */
export const getTechnicianStatistics = async (): Promise<{
  assigned: number;
  inProgress: number;
  completedToday: number;
  total: number;
}> => {
  const response = await apiClient.get<{
    status: string;
    data: { statistics: any };
  }>(`/tickets/technician/statistics`);
  return response.data.data.statistics;
};

/**
 * Get system analytics
 * Backend: GET /tickets/analytics
 * Note: Only accessible by managers
 */
export const getSystemAnalytics = async (): Promise<{
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  assignedTickets: number;
  closedTickets: number;
  resolutionRate: number;
  ticketsByCategory: {
    category: string;
    count: number;
    percentage: number;
  }[];
  ticketsByStatus: {
    status: string;
    count: number;
  }[];
  technicianPerformance: {
    technicianId: string;
    fullName: string;
    activeCount: number;
    resolvedThisMonth: number;
  }[];
}> => {
  const response = await apiClient.get<{
    status: string;
    data: { analytics: any };
  }>(`/tickets/analytics`);
  return response.data.data.analytics;
};

/**
 * Get top-rated technicians
 * Backend: GET /tickets/top-rated-technicians
 * Note: Only accessible by managers
 */
export const getTopRatedTechnicians = async (limit: number = 3): Promise<{
  technicianId: string;
  fullName: string;
  averageRating: number;
  ratingCount: number;
}[]> => {
  const response = await apiClient.get<{
    status: string;
    data: { technicians: any };
  }>(`/tickets/top-rated-technicians`, {
    params: { limit },
  });
  return response.data.data.technicians;
};
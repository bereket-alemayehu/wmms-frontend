/**
 * Ticket Feature Types
 * All type definitions for the ticket system
 */

export type TicketCategory = "Speed Issue" | "No Connection" | "Hardware Fault" | "Other"
export type TicketStatus = "Pending" | "Assigned" | "In Progress" | "Resolved" | "Closed"

export interface Ticket {
  _id: string
  customerId: string
  officeId: string
  category: TicketCategory
  description?: string
  status: TicketStatus
  assignedTo?: string
  refundEligible: boolean
  refundRequested: boolean
  rating?: number
  feedbackComment?: string
  createdAt: string
  updatedAt: string
  // Populated fields from backend
  customer?: {
    _id: string
    fullName: string
    phoneNumber: string
    serviceNumber?: string
  }
  office?: {
    _id: string
    cityName: string
    branchName: string
    location: string
  }
  technician?: {
    _id: string
    fullName: string
    phoneNumber: string
  }
}

// API Request Types
export interface CreateTicketRequest {
  category: TicketCategory
  description: string
  // Note: customerId and officeId are automatically set by backend from authenticated user
}

export interface UpdateTicketRequest {
  category?: TicketCategory
  description?: string
  status?: TicketStatus
  rating?: number
  feedbackComment?: string
}

export interface AssignTicketRequest {
  technicianId: string
}

// API Response Types
export interface TicketsListResponse {
  status: string
  results: number
  data: {
    tickets: Ticket[]
  }
}

export interface TicketResponse {
  status: string
  data: {
    ticket: Ticket
  }
}

// Filter/Query Types
export interface TicketFilters extends Record<string, unknown> {
  status?: TicketStatus
  category?: TicketCategory
  officeId?: string
  customerId?: string
  assignedTo?: string
  page?: number
  limit?: number
  sort?: string
}


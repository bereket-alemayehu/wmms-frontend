// Types based on the Mongoose schema

export type UserRole = "customer" | "supervisor" | "manager" | "technician"

export interface User {
  _id: string
  fullName: string
  phoneNumber: string
  role: UserRole
  serviceNumber?: string
  officeId?: string
  createdAt: string
  updatedAt: string
}

export interface Office {
  _id: string
  cityName: string
  branchName: string
  location: string
  activeTechniciansCount: number
  createdAt: string
  updatedAt: string
}

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
  // Populated fields
  customer?: User
  office?: Office
  technician?: User
}

export type RefundStatus = "Requested" | "Approved" | "Rejected"

export interface Refund {
  _id: string
  ticketId: string
  customerId: string
  amount: number
  status: RefundStatus
  adminComment?: string
  createdAt: string
  updatedAt: string
  // Populated
  ticket?: Ticket
  customer?: User
}

export type OutageStatus = "Active" | "Resolved"

export interface Outage {
  _id: string
  officeId: string
  postedBy: string
  title: string
  message: string
  affectedAreas: string[]
  status: OutageStatus
  estimatedResolution?: string
  createdAt: string
  updatedAt: string
  // Populated
  office?: Office
  supervisor?: User
}


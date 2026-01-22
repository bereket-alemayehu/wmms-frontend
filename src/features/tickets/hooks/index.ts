/**
 * Tickets Hooks Entry Point
 * Re-export all ticket-related hooks
 */

// Query Hooks
export { 
  useTickets, 
  useCustomerTickets, 
  useTechnicianTickets, 
  useOfficeTickets 
} from './useTickets'
export { useTicket } from './useTicket'
export { useTicketQueuePosition } from './useTicketQueuePosition'
export { useRefundEligibility } from './useRefundEligibility'
export { useOfficeQueueStatistics } from './useOfficeQueueStatistics'

// Mutation Hooks
export { useCreateTicket } from './useCreateTicket'
export { useUpdateTicket } from './useUpdateTicket'
export { useDeleteTicket } from './useDeleteTicket'
export { useAssignTicket } from './useAssignTicket'
export { useChangeTicketStatus } from './useChangeTicketStatus'
export { useSubmitFeedback } from './useSubmitFeedback'
export { useRequestRefund } from './useRequestRefund'
export { useConfirmResolution } from './useConfirmResolution'
export { useMarkNotResolved } from './useMarkNotResolved'


// src/__tests__/ticket-api.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock the axios client BEFORE importing the API module
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '@/lib/axios';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  changeTicketStatus,
  requestRefund,
  confirmTicketResolution,
  markTicketNotResolved,
  getTicketsByOffice,
  getTicketsByCustomer,
  getTicketsByTechnician,
  submitTicketFeedback,
  getTicketQueuePosition,
  checkRefundEligibility,
  getOfficeQueueStatistics,
  getSystemAnalytics,
  getTopRatedTechnicians,
  getResolutionEstimation,
} from '@/features/tickets/api/ticket';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

const sampleTicket = {
  _id: 't1',
  customerId: 'c1',
  officeId: 'o1',
  category: 'Speed Issue',
  status: 'Pending',
  assignedTo: null,
  refundEligible: false,
  refundRequested: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('Ticket API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getAllTickets returns normalized ticket list', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', data: { tickets: [sampleTicket] } },
    });
    const tickets = await getAllTickets();
    expect(mockGet).toHaveBeenCalledWith('/tickets', { params: undefined });
    expect(tickets).toHaveLength(1);
    expect(tickets[0]._id).toBe('t1');
  });

  test('getTicketById returns a single normalized ticket', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', data: { ticket: sampleTicket } },
    });
    const ticket = await getTicketById('t1');
    expect(mockGet).toHaveBeenCalledWith('/tickets/t1');
    expect(ticket._id).toBe('t1');
  });

  test('createTicket sends POST and returns new ticket', async () => {
    const newTicket = { ...sampleTicket, _id: 't2' };
    mockPost.mockResolvedValue({
      data: { status: 'success', data: { ticket: newTicket } },
    });
    const result = await createTicket({
      category: 'Speed Issue',
      description: 'Slow connection',
    });
    expect(mockPost).toHaveBeenCalledWith('/tickets', {
      category: 'Speed Issue',
      description: 'Slow connection',
    });
    expect(result._id).toBe('t2');
  });

  test('updateTicket sends PATCH and returns updated ticket', async () => {
    const updated = { ...sampleTicket, description: 'Updated desc' };
    mockPatch.mockResolvedValue({
      data: { status: 'success', data: { ticket: updated } },
    });
    const result = await updateTicket('t1', { description: 'Updated desc' });
    expect(mockPatch).toHaveBeenCalledWith('/tickets/t1', { description: 'Updated desc' });
    expect(result.description).toBe('Updated desc');
  });

  test('deleteTicket sends DELETE request', async () => {
    mockDelete.mockResolvedValue({ data: { status: 'success' } });
    await deleteTicket('t1');
    expect(mockDelete).toHaveBeenCalledWith('/tickets/t1');
  });

  test('assignTicket sends PATCH to assign endpoint', async () => {
    const assigned = { ...sampleTicket, assignedTo: 'tech1', status: 'Assigned' };
    mockPatch.mockResolvedValue({
      data: { status: 'success', data: { ticket: assigned } },
    });
    const result = await assignTicket('t1', { technicianId: 'tech1' });
    expect(mockPatch).toHaveBeenCalledWith('/tickets/t1/assign', { technicianId: 'tech1' });
    expect(result.assignedTo).toBe('tech1');
  });

  test('changeTicketStatus sends PATCH with new status', async () => {
    const updated = { ...sampleTicket, status: 'In Progress' };
    mockPatch.mockResolvedValue({
      data: { status: 'success', data: { ticket: updated } },
    });
    const result = await changeTicketStatus('t1', 'In Progress');
    expect(mockPatch).toHaveBeenCalledWith('/tickets/t1/status', {
      status: 'In Progress',
      assignedTo: undefined,
    });
    expect(result.status).toBe('In Progress');
  });

  test('requestRefund sends POST', async () => {
    const refunded = { ...sampleTicket, refundRequested: true };
    mockPost.mockResolvedValue({
      data: { status: 'success', data: { ticket: refunded } },
    });
    const result = await requestRefund('t1');
    expect(mockPost).toHaveBeenCalledWith('/tickets/t1/request-refund', {});
    expect(result.refundRequested).toBe(true);
  });

  test('confirmTicketResolution sends POST', async () => {
    const closed = { ...sampleTicket, status: 'Closed' };
    mockPost.mockResolvedValue({
      data: { status: 'success', data: { ticket: closed } },
    });
    const result = await confirmTicketResolution('t1');
    expect(mockPost).toHaveBeenCalledWith('/tickets/t1/confirm-resolution', {});
    expect(result.status).toBe('Closed');
  });

  test('markTicketNotResolved sends POST', async () => {
    const reopened = { ...sampleTicket, status: 'In Progress' };
    mockPost.mockResolvedValue({
      data: { status: 'success', data: { ticket: reopened } },
    });
    const result = await markTicketNotResolved('t1');
    expect(mockPost).toHaveBeenCalledWith('/tickets/t1/not-resolved', {});
    expect(result.status).toBe('In Progress');
  });

  test('getTicketsByOffice with status filter', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', results: 1, data: { tickets: [sampleTicket] } },
    });
    const tickets = await getTicketsByOffice('Pending');
    expect(mockGet).toHaveBeenCalledWith('/tickets/office/tickets', { params: { status: 'Pending' } });
    expect(tickets).toHaveLength(1);
  });

  test('getTicketsByOffice without status filter', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', results: 1, data: { tickets: [sampleTicket] } },
    });
    const tickets = await getTicketsByOffice();
    expect(mockGet).toHaveBeenCalledWith('/tickets/office/tickets', { params: {} });
    expect(tickets).toHaveLength(1);
  });

  test('getTicketsByCustomer fetches customer tickets', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', results: 1, data: { tickets: [sampleTicket] } },
    });
    const tickets = await getTicketsByCustomer();
    expect(mockGet).toHaveBeenCalledWith('/tickets/customer/my-tickets');
    expect(tickets).toHaveLength(1);
  });

  test('getTicketsByTechnician with status', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', results: 1, data: { tickets: [sampleTicket] } },
    });
    const tickets = await getTicketsByTechnician('Assigned');
    expect(mockGet).toHaveBeenCalledWith('/tickets/technician/my-tickets', { params: { status: 'Assigned' } });
    expect(tickets).toHaveLength(1);
  });

  test('getTicketsByTechnician without status', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', results: 1, data: { tickets: [sampleTicket] } },
    });
    const tickets = await getTicketsByTechnician();
    expect(mockGet).toHaveBeenCalledWith('/tickets/technician/my-tickets', { params: {} });
    expect(tickets).toHaveLength(1);
  });

  test('submitTicketFeedback sends POST with rating and comment', async () => {
    const rated = { ...sampleTicket, rating: 5, feedbackComment: 'Great!' };
    mockPost.mockResolvedValue({
      data: { status: 'success', data: { ticket: rated } },
    });
    const result = await submitTicketFeedback('t1', 5, 'Great!');
    expect(mockPost).toHaveBeenCalledWith('/tickets/t1/feedback', { rating: 5, feedbackComment: 'Great!' });
    expect(result.rating).toBe(5);
  });

  test('getTicketQueuePosition returns position', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'success', data: { ticketId: 't1', queuePosition: 3 } },
    });
    const result = await getTicketQueuePosition('t1');
    expect(result.queuePosition).toBe(3);
  });

  test('checkRefundEligibility returns eligibility flags', async () => {
    mockGet.mockResolvedValue({
      data: {
        status: 'success',
        data: { ticketId: 't1', refundEligible: true, refundRequested: false },
      },
    });
    const result = await checkRefundEligibility('t1');
    expect(result.refundEligible).toBe(true);
    expect(result.refundRequested).toBe(false);
  });

  test('getOfficeQueueStatistics returns stats object', async () => {
    const stats = { pending: 5, assigned: 3 };
    mockGet.mockResolvedValue({
      data: { status: 'success', data: { statistics: stats } },
    });
    const result = await getOfficeQueueStatistics();
    expect(result).toEqual(stats);
  });

  test('getSystemAnalytics returns analytics data', async () => {
    const analytics = { totalTickets: 100, resolvedTickets: 80 } as any;
    mockGet.mockResolvedValue({
      data: { status: 'success', data: { analytics } },
    });
    const result = await getSystemAnalytics();
    expect(result.totalTickets).toBe(100);
    expect(result.resolvedTickets).toBe(80);
  });

  test('getTopRatedTechnicians returns technician list', async () => {
    const techs = [{ technicianId: 'tech1', fullName: 'Alice', averageRating: 4.8, ratingCount: 10 }];
    mockGet.mockResolvedValue({
      data: { status: 'success', data: { technicians: techs } },
    });
    const result = await getTopRatedTechnicians(3);
    expect(mockGet).toHaveBeenCalledWith('/tickets/top-rated-technicians', { params: { limit: 3 } });
    expect(result).toHaveLength(1);
    expect(result[0].averageRating).toBe(4.8);
  });

  test('getResolutionEstimation with params', async () => {
    const estimation = { estimatedTimeMs: 3600000, estimatedTimeHours: 1, estimatedTimeDays: 0.04 };
    mockGet.mockResolvedValue({
      data: { status: 'success', data: estimation },
    });
    const result = await getResolutionEstimation('o1', 'Speed Issue');
    expect(mockGet).toHaveBeenCalledWith('/tickets/estimation', { params: { officeId: 'o1', category: 'Speed Issue' } });
    expect(result.estimatedTimeHours).toBe(1);
  });

  test('getResolutionEstimation without params', async () => {
    const estimation = { estimatedTimeMs: 7200000, estimatedTimeHours: 2, estimatedTimeDays: 0.08 };
    mockGet.mockResolvedValue({
      data: { status: 'success', data: estimation },
    });
    const result = await getResolutionEstimation();
    expect(mockGet).toHaveBeenCalledWith('/tickets/estimation', { params: {} });
    expect(result.estimatedTimeHours).toBe(2);
  });
});

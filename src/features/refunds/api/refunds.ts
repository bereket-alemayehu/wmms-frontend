import apiClient from "@/lib/axios";
import { safeId, unwrapList, unwrapSingle } from "@/lib/api-unwrappers";
import type { Refund } from "../types";

type RawRefund = any;

function normalizeRefund(raw: RawRefund): Refund {
  const ticketObj =
    raw?.ticketId && typeof raw.ticketId === "object"
      ? raw.ticketId
      : undefined;
  const customerObj =
    raw?.customerId && typeof raw.customerId === "object"
      ? raw.customerId
      : undefined;

  return {
    ...raw,
    ticketId: safeId(raw?.ticketId) || safeId(ticketObj) || "",
    customerId: safeId(raw?.customerId) || safeId(customerObj) || "",
    ticket: ticketObj,
    customer: customerObj,
  };
}

export interface CreateRefundRequest {
  ticketId: string;
  customerId: string;
  amount: number;
}

export const refundsApi = {
  getAll: async (params?: Record<string, any>): Promise<Refund[]> => {
    const response = await apiClient.get("/refunds", { params });
    const list = unwrapList<RawRefund>(response.data);
    return list.map(normalizeRefund);
  },

  getById: async (id: string): Promise<Refund> => {
    const response = await apiClient.get(`/refunds/${id}`);
    return normalizeRefund(unwrapSingle<RawRefund>(response.data));
  },

  create: async (data: CreateRefundRequest): Promise<Refund> => {
    const response = await apiClient.post("/refunds", data);
    return normalizeRefund(unwrapSingle<RawRefund>(response.data));
  },

  update: async (
    id: string,
    data: Partial<CreateRefundRequest & { status: string }>,
  ): Promise<Refund> => {
    const response = await apiClient.patch(`/refunds/${id}`, data);
    return normalizeRefund(unwrapSingle<RawRefund>(response.data));
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/refunds/${id}`);
  },
};

import apiClient from "@/lib/axios";
import { unwrapList, unwrapSingle } from "@/lib/api-unwrappers";
import type { Outage } from "../types";

export interface CreateOutageRequest {
  officeId?: string;
  title: string;
  message: string;
  affectedAreas: string[];
  estimatedResolution?: string;
}

export interface UpdateOutageRequest {
  title?: string;
  message?: string;
  affectedAreas?: string[];
  status?: "Active" | "Resolved";
  estimatedResolution?: string;
}

export const outagesApi = {
  getAll: async (officeId?: string): Promise<Outage[]> => {
    const response = await apiClient.get("/outages", { params: { officeId } });
    return unwrapList<Outage>(response.data);
  },

  getById: async (id: string): Promise<Outage> => {
    const response = await apiClient.get(`/outages/${id}`);
    return unwrapSingle<Outage>(response.data);
  },

  create: async (data: CreateOutageRequest): Promise<Outage> => {
    const response = await apiClient.post("/outages", data);
    return unwrapSingle<Outage>(response.data);
  },

  update: async (id: string, data: UpdateOutageRequest): Promise<Outage> => {
    const response = await apiClient.patch(`/outages/${id}`, data);
    return unwrapSingle<Outage>(response.data);
  },

  resolve: async (id: string): Promise<Outage> => {
    const response = await apiClient.post(`/outages/${id}/resolve`);
    return unwrapSingle<Outage>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/outages/${id}`);
  },
};

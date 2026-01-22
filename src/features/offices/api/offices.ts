import apiClient from "@/lib/axios";
import { unwrapList, unwrapSingle } from "@/lib/api-unwrappers";
import type { Office } from "../types";

export interface CreateOfficeRequest {
  cityName: string;
  branchName: string;
  location: string;
  activeTechniciansCount?: number;
}

export const officesApi = {
  getAll: async (params?: Record<string, any>): Promise<Office[]> => {
    const response = await apiClient.get("/offices", { params });
    return unwrapList<Office>(response.data);
  },

  getById: async (id: string): Promise<Office> => {
    const response = await apiClient.get(`/offices/${id}`);
    return unwrapSingle<Office>(response.data);
  },

  create: async (data: CreateOfficeRequest): Promise<Office> => {
    const response = await apiClient.post("/offices", data);
    return unwrapSingle<Office>(response.data);
  },

  update: async (
    id: string,
    data: Partial<CreateOfficeRequest>,
  ): Promise<Office> => {
    const response = await apiClient.patch(`/offices/${id}`, data);
    return unwrapSingle<Office>(response.data);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/offices/${id}`);
  },
};

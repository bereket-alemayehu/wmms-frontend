import apiClient from "@/lib/axios";
import { unwrapList, unwrapSingle } from "@/lib/api-unwrappers";
import type { Office } from "../types";

export interface CreateOfficeRequest {
  cityName: string;
  branchName: string;
  location: string;
  activeTechniciansCount?: number;
}

/**
 * Get all offices with optional filters
 */
export const getAllOffices = async (
  params?: Record<string, any>,
): Promise<Office[]> => {
  const response = await apiClient.get("/offices", { params });
  return unwrapList<Office>(response.data);
};

/**
 * Get a single office by ID
 */
export const getOfficeById = async (id: string): Promise<Office> => {
  const response = await apiClient.get(`/offices/${id}`);
  return unwrapSingle<Office>(response.data);
};

/**
 * Create a new office
 */
export const createOffice = async (
  data: CreateOfficeRequest,
): Promise<Office> => {
  const response = await apiClient.post("/offices", data);
  return unwrapSingle<Office>(response.data);
};

/**
 * Update an existing office
 */
export const updateOffice = async (
  id: string,
  data: Partial<CreateOfficeRequest>,
): Promise<Office> => {
  const response = await apiClient.patch(`/offices/${id}`, data);
  return unwrapSingle<Office>(response.data);
};

/**
 * Delete an office
 */
export const deleteOffice = async (id: string): Promise<void> => {
  await apiClient.delete(`/offices/${id}`);
};

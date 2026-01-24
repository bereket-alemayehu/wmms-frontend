/**
 * Outage API
 * All backend interactions for the outage feature
 * Uses centralized axios client with cookie-based authentication
 */

import apiClient from "@/lib/axios";
import type { Outage } from "../types";

type RawOutage = any;

const normalizeOutage = (raw: RawOutage): Outage => {
  const officeObj =
    raw?.officeId && typeof raw.officeId === "object"
      ? raw.officeId
      : raw?.office;
  const postedByObj =
    raw?.postedBy && typeof raw.postedBy === "object"
      ? raw.postedBy
      : raw?.postedByUser;

  return {
    ...raw,
    officeId:
      typeof raw?.officeId === "object" ? raw.officeId?._id : raw?.officeId,
    postedBy:
      typeof raw?.postedBy === "object" ? raw.postedBy?._id : raw?.postedBy,
    office: officeObj,
    postedByUser: postedByObj,
  };
};

const unwrapOutage = (data: any): Outage => {
  const raw = data?.outage ?? data?.document ?? data?.data ?? data;
  return normalizeOutage(raw);
};

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

/**
 * Get all outages with optional office filter
 * Backend: GET /outages
 */
export const getAllOutages = async (
  officeId?: string,
): Promise<Outage[]> => {
  const response = await apiClient.get<{
    status: string;
    data: { outages?: RawOutage[]; documents?: RawOutage[] };
  }>("/outages", { params: officeId ? { officeId } : {} });
  const list = response.data.data.outages ?? response.data.data.documents ?? [];
  return list.map(normalizeOutage);
};

/**
 * Get a single outage by ID
 * Backend: GET /outages/:id
 */
export const getOutageById = async (id: string): Promise<Outage> => {
  const response = await apiClient.get<{
    status: string;
    data: { document?: RawOutage; outage?: RawOutage; data?: RawOutage };
  }>(`/outages/${id}`);
  return unwrapOutage(response.data.data);
};

/**
 * Create a new outage
 * Backend: POST /outages
 */
export const createOutage = async (
  data: CreateOutageRequest,
): Promise<Outage> => {
  const response = await apiClient.post<{
    status: string;
    data: { document?: RawOutage; outage?: RawOutage; data?: RawOutage };
  }>("/outages", data);
  return unwrapOutage(response.data.data);
};

/**
 * Update an existing outage
 * Backend: PATCH /outages/:id
 */
export const updateOutage = async (
  id: string,
  data: UpdateOutageRequest,
): Promise<Outage> => {
  const response = await apiClient.patch<{
    status: string;
    data: { outage?: RawOutage; document?: RawOutage; data?: RawOutage };
  }>(`/outages/${id}`, data);
  return unwrapOutage(response.data.data);
};

/**
 * Resolve an outage
 * Backend: POST /outages/:id/resolve
 */
export const resolveOutage = async (id: string): Promise<Outage> => {
  const response = await apiClient.post<{
    status: string;
    data: { outage?: RawOutage; document?: RawOutage; data?: RawOutage };
  }>(`/outages/${id}/resolve`);
  return unwrapOutage(response.data.data);
};

/**
 * Delete an outage
 * Backend: DELETE /outages/:id
 */
export const deleteOutage = async (id: string): Promise<void> => {
  await apiClient.delete(`/outages/${id}`);
};

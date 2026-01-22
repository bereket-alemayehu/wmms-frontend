export interface ApiListResponse<T> {
  status?: string;
  results?: number;
  data?: {
    documents?: T[];
  };
}

export interface ApiSingleResponse<T> {
  status?: string;
  data?: {
    document?: T;
    data?: T;
    ticket?: T;
  };
}

export function unwrapList<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.documents)) return payload.data.documents;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.documents)) return payload.documents;
  return [];
}

export function unwrapSingle<T>(payload: any): T {
  if (!payload) throw new Error("Empty response payload");
  const direct =
    payload?.data?.document ?? payload?.data?.data ?? payload?.data?.ticket;
  if (direct) return direct as T;
  if (payload?.document) return payload.document as T;
  return payload as T;
}

export function safeId(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && typeof value._id === "string")
    return value._id;
  return "";
}

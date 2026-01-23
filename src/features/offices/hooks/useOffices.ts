/**
 * useOffices Hook
 * React Query hook for fetching offices list
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAllOffices } from "../api/office";

export const useOffices = (params?: Record<string, any>, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.offices.list((params || {}) as Record<string, unknown>),
    queryFn: () => getAllOffices(params),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};

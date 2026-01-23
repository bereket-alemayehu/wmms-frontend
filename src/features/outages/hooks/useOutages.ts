/**
 * useOutages Hook
 * React Query hook for fetching outages list
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { outagesApi } from "../api/outages";

export const useOutages = (officeId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.outages.list({ officeId }),
    queryFn: () => outagesApi.getAll(officeId),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};

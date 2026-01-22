/**
 * useOffice Hook
 * React Query hook for fetching a single office
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getOfficeById } from "../api/office";

export const useOffice = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.offices.detail(id),
    queryFn: () => getOfficeById(id),
    enabled: Boolean(id) && enabled,
    staleTime: 1000 * 60 * 2,
  });
};

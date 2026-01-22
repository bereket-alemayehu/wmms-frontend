/**
 * useCreateOffice Hook
 * React Query mutation hook for creating offices
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createOffice } from "../api/office";
import type { CreateOfficeRequest } from "../api/office";

export const useCreateOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfficeRequest) => createOffice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offices.all });
    },
  });
};

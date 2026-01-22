/**
 * useUpdateOffice Hook
 * React Query mutation hook for updating offices
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { updateOffice } from "../api/office";
import type { CreateOfficeRequest } from "../api/office";

export const useUpdateOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateOfficeRequest>;
    }) => updateOffice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offices.all });
    },
  });
};

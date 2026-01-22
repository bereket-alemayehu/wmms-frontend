/**
 * useDeleteOffice Hook
 * React Query mutation hook for deleting offices
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { deleteOffice } from "../api/office";

export const useDeleteOffice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOffice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offices.all });
    },
  });
};

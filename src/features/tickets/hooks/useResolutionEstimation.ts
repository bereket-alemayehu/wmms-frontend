
import { useQuery } from "@tanstack/react-query";
import { getResolutionEstimation } from "../api/ticket";

export const useResolutionEstimation = (
    officeId?: string,
    category?: string,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ["tickets", "estimation", officeId, category],
        queryFn: () => getResolutionEstimation(officeId, category),
        enabled,
        staleTime: 1000 * 60 * 60, // 1 hour (estimates don't change that often)
    });
};

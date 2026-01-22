import { useCallback, useEffect, useState } from "react";
import type { Refund } from "../types";
import { refundsApi } from "../api/refunds";

export function useRefunds(params?: Record<string, any>) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await refundsApi.getAll(params);
      setRefunds(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load refunds",
      );
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  return { refunds, isLoading, error, refresh: fetchRefunds };
}

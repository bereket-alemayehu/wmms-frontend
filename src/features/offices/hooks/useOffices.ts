import { useCallback, useEffect, useState } from "react";
import type { Office } from "../types";
import { officesApi } from "../api/offices";

const officesCache = new Map<string, Office[]>();
const inflightRequests = new Map<string, Promise<Office[]>>();

function makeCacheKey(params?: Record<string, any>) {
  if (!params) return "__default__";
  try {
    const keys = Object.keys(params).sort();
    const normalized: Record<string, any> = {};
    for (const key of keys) normalized[key] = params[key];
    return JSON.stringify(normalized);
  } catch {
    return "__default__";
  }
}

export function useOffices(params?: Record<string, any>) {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffices = useCallback(
    async (force?: boolean) => {
      const cacheKey = makeCacheKey(params);

      if (!force) {
        const cached = officesCache.get(cacheKey);
        if (cached) {
          setOffices(cached);
          return;
        }
      }

      setIsLoading(true);
      setError(null);
      try {
        const existingInflight = inflightRequests.get(cacheKey);
        const request =
          existingInflight ||
          officesApi
            .getAll(params)
            .then((data) => {
              officesCache.set(cacheKey, data);
              return data;
            })
            .finally(() => {
              inflightRequests.delete(cacheKey);
            });

        if (!existingInflight) inflightRequests.set(cacheKey, request);

        const data = await request;
        setOffices(data);
      } catch (e: any) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load offices",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [params],
  );

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  return { offices, isLoading, error, refresh: () => fetchOffices(true) };
}

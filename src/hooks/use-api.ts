"use client";

import useSWR, { SWRConfiguration } from "swr";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

function createFetcher() {
  return async (url: string) => {
    const res = await fetch(url, { credentials: "same-origin" });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Request failed");
    return data.data;
  };
}

export function useApi<T>(url: string | null, config?: SWRConfiguration) {
  const fetcher = createFetcher();
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    ...config,
  });
}

export function useApiMutate() {
  const { toast } = useToast();

  const apiRequest = useCallback(
    async (url: string, method: string, body?: unknown) => {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();

      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
        throw new Error(data.error);
      }

      return data;
    },
    [toast]
  );

  return { apiRequest };
}

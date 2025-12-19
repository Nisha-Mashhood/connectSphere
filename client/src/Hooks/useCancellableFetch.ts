import { useEffect, useRef, useCallback } from "react";
import axios from "axios";

export const useCancellableFetch = <T,>(
  fetchFn: (signal: AbortSignal) => Promise<T>
) => {
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      return await fetchFn(controller.signal);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("[canceled]");
        return null;
      }
      throw err;
    }
  }, [fetchFn]); 

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [fetch]);

  return fetch;
};
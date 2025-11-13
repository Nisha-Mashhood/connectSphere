import { useEffect, useRef, useCallback, DependencyList } from "react";
import axios from "axios";

export const useCancellableFetch = <T,>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList
) => {
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    // Cancel any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      return await fetchFn(controller.signal);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("[canceled]", err.message);
        return null;
      }
      throw err;
    }
  }, deps); 

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [fetch]);

  return fetch;
};
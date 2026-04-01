'use client';

import { useState, useEffect, useRef } from 'react';

interface UseApiDataResult<T> {
  data: T;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useApiData<T>(
  endpoint: string,
  mockGenerator: () => T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformResponse: (raw: any) => T
): UseApiDataResult<T> {
  const [mock] = useState<T>(mockGenerator);
  const [data, setData] = useState<T>(mock);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const raw = await res.json();
        const transformed = transformResponse(raw);
        setData(transformed);
        setIsLive(true);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'API failed');
        // Mock data remains as fallback
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [endpoint, transformResponse]);

  return { data, isLive, isLoading, error };
}

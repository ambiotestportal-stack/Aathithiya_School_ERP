import { useState, useCallback } from 'react';

interface UseApiResult<T, A extends any[]> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: A) => Promise<T | null>;
}

export function useApi<T, A extends any[]>(
  apiFunc: (...args: A) => Promise<T>
): UseApiResult<T, A> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(async (...args: A): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunc]);

  return { data, error, isLoading, execute };
}

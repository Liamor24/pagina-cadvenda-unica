import { useState, useEffect, useCallback } from 'react';
import { executeWithRetry } from '@/utils/supabase-utils';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Hook para carregar dados com retry automático
 * Reconecta automaticamente quando a conexão é perdida
 */
export function useSuperbaseDataWithRetry<T>(
  fetchFn: () => Promise<T>,
  operationName: string,
  dependencies: any[] = []
): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const performFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await executeWithRetry(fetchFn, operationName);
      setData(result);
      setRetryCount(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, operationName]);

  useEffect(() => {
    performFetch();
  }, dependencies);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    performFetch();
  }, [performFetch]);

  return { data, loading, error, retry };
}

// hooks/usePolling.ts
import { useState, useEffect } from 'react';

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

interface PollingState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function usePolling<T>(
  url: string,
  options: PollingOptions = {}
) {
  const {
    interval = 10000, // 10 seconds default
    enabled = true,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    error: null,
    isLoading: false,
    lastUpdated: null
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState({
        data,
        error: null,
        isLoading: false,
        lastUpdated: new Date()
      });

      onSuccess?.(data);
    } catch (error) {
      const errorObject = error instanceof Error ? error : new Error(String(error));

      setState(prev => ({
        ...prev,
        error: errorObject,
        isLoading: false,
        lastUpdated: new Date()
      }));

      onError?.(errorObject);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(fetchData, interval);

    // Cleanup on unmount or when enabled changes
    return () => {
      clearInterval(intervalId);
    };
  }, [url, interval, enabled]);

  // Return state and manual fetch trigger
  return {
    ...state,
    refetch: fetchData
  };
}

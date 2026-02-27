import { useRef, useEffect, useCallback } from 'react';

interface UseLazyLoadOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

/**
 * Reusable hook for lazy loading with Intersection Observer
 * 
 * Usage:
 * const observerTarget = useLazyLoad({
 *   hasMore: pagination?.hasMore,
 *   loading: loadingMore,
 *   onLoadMore: () => dispatch(loadMore({ page: pagination.page + 1 }))
 * });
 * 
 * return <div ref={observerTarget}>Loading...</div>
 */
export function useLazyLoad({
  hasMore,
  loading,
  onLoadMore,
  threshold = 0.1,
}: UseLazyLoadOptions) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return observerTarget;
}

/**
 * Debounce hook for search inputs
 * 
 * Usage:
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   dispatch(fetchProducts({ search: debouncedSearch }));
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Missing import
import { useState } from 'react';

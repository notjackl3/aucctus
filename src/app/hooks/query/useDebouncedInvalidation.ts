import { useQueryClient, QueryKey } from 'react-query';
import useStore from '@stores/store';
import { useEffect } from 'react';

/**
 * Hook that provides a debounced query invalidation mechanism.
 * Multiple invalidation requests for the same query key within the debounce
 * window are collapsed into a single invalidation call.
 *
 * @param delayMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Object with debouncedInvalidate function
 *
 * @example
 * ```typescript
 * const { debouncedInvalidate } = useDebouncedInvalidation();
 * debouncedInvalidate([AucctusQueryKeys.someKey, param]);
 * ```
 */
export const useDebouncedInvalidation = (delayMs = 500) => {
  const queryClient = useQueryClient();
  const { scheduleDebouncedInvalidation, clearAll } = useStore(
    (state) => state.queryInvalidation,
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  const debouncedInvalidate = (queryKey: QueryKey) => {
    // Serialize the query key to create a unique identifier
    const serializedKey = JSON.stringify(queryKey);

    // Schedule the debounced invalidation
    scheduleDebouncedInvalidation(
      serializedKey,
      () => {
        queryClient.invalidateQueries(queryKey);
      },
      delayMs,
    );
  };

  return { debouncedInvalidate };
};

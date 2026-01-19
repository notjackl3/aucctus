import { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import type { IEcosystemProductSearchUpdateMessage } from '@libs/api/types';

/**
 * Hook to listen for product search WebSocket updates and invalidate the ecosystem query
 * when product search completes.
 */
export const useProductSearchSocket = (conceptId: string): void => {
  const queryClient = useQueryClient();

  const handleProductSearchUpdate = useCallback(
    (data: IEcosystemProductSearchUpdateMessage) => {
      // Only process updates for this concept
      if (data.conceptUuid !== conceptId) return;

      // When product search completes, invalidate the ecosystem query to refresh data
      if (data.status === 'complete') {
        queryClient.invalidateQueries({
          queryKey: ['ecosystem-v2', conceptId],
        });
      }
    },
    [conceptId, queryClient],
  );

  useSocketEvent('ecosystem.product_search.update', handleProductSearchUpdate);
};

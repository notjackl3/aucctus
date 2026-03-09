/**
 * Overseer History React Query Hooks
 *
 * Provides data fetching hooks for Overseer conversation history.
 */

import api from '@libs/api';
import type {
  IOverseerConversation,
  IOverseerConversationDetail,
} from '@libs/api/types/overseer';
import { useInfiniteQuery, useQuery } from 'react-query';

// ============================================
// Query Keys
// ============================================

export const overseerHistoryKeys = {
  all: ['overseerHistory'] as const,
  conversations: (params?: { page?: number }) =>
    [...overseerHistoryKeys.all, 'conversations', params] as const,
  conversationsInfinite: () =>
    [...overseerHistoryKeys.all, 'conversations', 'infinite'] as const,
  conversation: (uuid: string) =>
    [...overseerHistoryKeys.all, 'conversation', uuid] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Fetches paginated Overseer conversations for the current user (global history).
 */
export const useOverseerConversations = (params?: {
  page?: number;
  enabled?: boolean;
}) => {
  const { enabled = true, ...queryParams } = params ?? {};

  return useQuery({
    queryKey: overseerHistoryKeys.conversations(queryParams),
    queryFn: async (): Promise<IOverseerConversation[]> => {
      const response = await api.overseer.getConversations(queryParams);
      return response.items;
    },
    enabled,
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetches all Overseer conversations using infinite pagination.
 * Accumulates pages so the full history is available.
 */
export const useOverseerConversationsInfinite = (params?: {
  enabled?: boolean;
}) => {
  const { enabled = true } = params ?? {};

  const query = useInfiniteQuery(
    overseerHistoryKeys.conversationsInfinite(),
    async ({ pageParam = 1 }) => {
      return api.overseer.getConversations({ page: pageParam });
    },
    {
      enabled,
      staleTime: 1000 * 30,
      cacheTime: 1000 * 60 * 5,
      getNextPageParam: (lastPage, allPages) => {
        const totalLoaded = allPages.reduce(
          (sum, page) => sum + page.items.length,
          0,
        );
        if (totalLoaded < lastPage.count) {
          return allPages.length + 1;
        }
        return undefined;
      },
    },
  );

  const items: IOverseerConversation[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    ...query,
    items,
    hasNextPage: query.hasNextPage ?? false,
  };
};

/**
 * Fetches a single Overseer conversation with all messages.
 */
export const useOverseerConversation = (uuid?: string) => {
  return useQuery({
    queryKey: overseerHistoryKeys.conversation(uuid ?? ''),
    queryFn: async (): Promise<IOverseerConversationDetail> => {
      return await api.overseer.getConversation(uuid!);
    },
    enabled: !!uuid,
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });
};

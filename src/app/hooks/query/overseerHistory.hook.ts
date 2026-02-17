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
import { useQuery } from 'react-query';

// ============================================
// Query Keys
// ============================================

export const overseerHistoryKeys = {
  all: ['overseerHistory'] as const,
  conversations: (params?: {
    conceptUuid?: string;
    accountUuid?: string;
    page?: number;
  }) => [...overseerHistoryKeys.all, 'conversations', params] as const,
  conversation: (uuid: string) =>
    [...overseerHistoryKeys.all, 'conversation', uuid] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Fetches paginated Overseer conversations scoped to a concept or account.
 */
export const useOverseerConversations = (params?: {
  page?: number;
  conceptUuid?: string;
  accountUuid?: string;
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

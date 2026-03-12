/**
 * Concept Shares React Query Hooks
 *
 * Provides data fetching hooks for authenticated share management
 * (create, list, revoke shares for concept reports).
 */

import { toast } from '@components';
import api from '@libs/api';
import type { ICreateShareRequest } from '@libs/api/types/sharedReport';
import utils from '@libs/utils';
import { useMutation, useQuery, useQueryClient } from 'react-query';

// ============================================
// Query Keys
// ============================================

export const conceptShareKeys = {
  all: ['conceptShares'] as const,
  list: (identifier: string) =>
    [...conceptShareKeys.all, 'list', identifier] as const,
  config: (identifier: string) =>
    [...conceptShareKeys.all, 'config', identifier] as const,
};

// ============================================
// Hooks
// ============================================

/**
 * Fetches allowed sharing domains for the current user/account.
 */
export function useShareConfig(identifier: string) {
  return useQuery(
    conceptShareKeys.config(identifier),
    () => api.sharedReport.getShareConfig(identifier),
    {
      enabled: !!identifier,
    },
  );
}

/**
 * Fetches all shares for a concept report.
 */
export function useConceptShares(identifier: string) {
  return useQuery(
    conceptShareKeys.list(identifier),
    () => api.sharedReport.listShares(identifier),
    {
      enabled: !!identifier,
    },
  );
}

/**
 * Creates a new share invite for a concept report.
 */
export function useCreateShare(identifier: string) {
  const queryClient = useQueryClient();

  return useMutation(
    (data: ICreateShareRequest) =>
      api.sharedReport.createShare(identifier, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(conceptShareKeys.list(identifier));
        toast.success('Share invite sent successfully');
      },
      onError: (error: unknown) => {
        const message = utils.osiris.parseFormError(error);
        toast.error('Failed to send share invite', message);
      },
    },
  );
}

/**
 * Revokes a share invite.
 */
export function useRevokeShare(identifier: string) {
  const queryClient = useQueryClient();

  return useMutation(
    (shareUuid: string) => api.sharedReport.revokeShare(identifier, shareUuid),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(conceptShareKeys.list(identifier));
        toast.success('Share access revoked');
      },
      onError: () => {
        toast.error('Failed to revoke share');
      },
    },
  );
}

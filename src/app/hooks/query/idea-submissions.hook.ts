/**
 * React Query hooks for idea submissions.
 */

import api from '@libs/api';
import {
  IIdeaSubmissionDetail,
  ISubmissionFilterParams,
  ISubmissionLink,
  ISubmissionListResponse,
} from '@libs/api/types/ideaSubmissions';
import { useQuery } from 'react-query';

import { AucctusQueryKeys } from './query-keys';

/**
 * Hook to fetch all submission links for the current account
 */
export const useSubmissionLinks = () => {
  const query = useQuery<ISubmissionLink[]>({
    queryKey: [AucctusQueryKeys.submissionLinks],
    queryFn: () => api.ideaSubmissions.listSubmissionLinks(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { ...query, submissionLinks: query.data ?? [] };
};

/**
 * Hook to fetch a single submission link by UUID
 */
export const useSubmissionLink = (linkUuid: string | null) => {
  const query = useQuery<ISubmissionLink | null>({
    queryKey: [AucctusQueryKeys.submissionLink, linkUuid],
    queryFn: async () => {
      if (!linkUuid) return null;
      return api.ideaSubmissions.getSubmissionLink(linkUuid);
    },
    enabled: !!linkUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { ...query, submissionLink: query.data };
};

/**
 * Hook to fetch all submissions for a specific link
 * @param linkUuid - The UUID of the submission link
 * @param filters - Optional filter parameters for sorting and filtering submissions
 */
export const useSubmissionLinkSubmissions = (
  linkUuid: string | null,
  filters?: ISubmissionFilterParams,
) => {
  const query = useQuery<ISubmissionListResponse>({
    queryKey: [AucctusQueryKeys.submissionLinkSubmissions, linkUuid, filters],
    queryFn: async () => {
      if (!linkUuid)
        return { submissions: [], metadata: { scoringQuestions: [] } };
      return api.ideaSubmissions.getSubmissionsByLink(linkUuid, filters);
    },
    enabled: !!linkUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    // Keep previous data visible while fetching new filtered results
    // This prevents the loading flash when filters change
    keepPreviousData: true,
  });

  // isPreviousData indicates we're showing stale data while fetching
  return {
    ...query,
    submissions: query.data?.submissions ?? [],
    metadata: query.data?.metadata ?? null,
    isFiltering: query.isFetching && query.isPreviousData,
  };
};

/**
 * Hook to fetch detailed submission with full score breakdown.
 * Includes category scores, individual question scores, and AI reasoning.
 *
 * @param linkUuid - The submission link UUID
 * @param submissionUuid - The submission UUID
 */
export const useSubmissionDetail = (
  linkUuid: string | null,
  submissionUuid: string | null,
) => {
  const query = useQuery<IIdeaSubmissionDetail | null>({
    queryKey: [
      AucctusQueryKeys.submissionDetail,
      linkUuid,
      submissionUuid,
      'detail',
    ],
    queryFn: async () => {
      if (!linkUuid || !submissionUuid) return null;
      try {
        return await api.ideaSubmissions.getSubmissionDetail(
          linkUuid,
          submissionUuid,
        );
      } catch (error: any) {
        // 404 is expected when detailed scoring doesn't exist yet
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!linkUuid && !!submissionUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  return { ...query, submissionDetail: query.data };
};

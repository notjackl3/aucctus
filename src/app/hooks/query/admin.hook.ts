import { toast } from '@components';
import api from '@libs/api';
import { MetricsTimeRange } from '@libs/api/types';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import {
  UserMetricsListResponse,
  UserMetricsDetail,
} from '@libs/api/types/admin';

/**
 * Custom hook for fetching the account logo URL.
 * Returns the presigned URL for the account's custom logo if one exists.
 */
export const useAccountLogo = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.accountLogo],
    queryFn: async () => await api.account.getAccountLogo(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });

  return {
    ...query,
    logoUrl: query.data?.logoUrl || null,
    hasLogo: !!query.data?.logoUrl,
  };
};

/**
 * Custom hook for fetching admin metrics for the dashboard.
 * Admin only. Returns computed metrics for the current account.
 *
 * @param timeRange - Time range for metrics filtering (7d, 30d, 90d, all)
 */
export const useAdminMetrics = (timeRange: MetricsTimeRange = 'all') => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.adminMetrics, timeRange],
    queryFn: async () => await api.admin.getMetrics(timeRange),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    onError: (e: AxiosError) => {
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'aucctus_admin_required') {
        toast.error(
          'Permission Denied',
          'This feature is restricted to Aucctus administrators.',
        );
      } else if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Metrics Fetch Failed',
          message || 'Unable to fetch metrics. Please try again.',
        );
      }
    },
  });

  return {
    ...query,
    metrics: query.data,
    hasMetrics: !!query.data,
    isForbidden:
      query.error && (query.error as AxiosError)?.response?.status === 403,
  };
};

/**
 * Custom hook for uploading account logo.
 * Admin only. Uploads a custom logo for the account.
 */
export const useUploadAccountLogo = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (image: File) => await api.admin.uploadAccountLogo(image),
    onSuccess: (data) => {
      // Invalidate account logo query to refresh logo URL
      queryClient.invalidateQueries([AucctusQueryKeys.accountLogo]);
      toast.success(
        'Logo Uploaded',
        data.message || 'Account logo uploaded successfully.',
      );
    },
    onError: (e: AxiosError) => {
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'aucctus_admin_required') {
        toast.error(
          'Permission Denied',
          'This feature is restricted to Aucctus administrators.',
        );
      } else {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Upload Failed',
          message || 'Unable to upload logo. Please try again.',
        );
      }
    },
  });

  return {
    uploadLogo: mutation.mutate,
    isUploading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    uploadedLogoUrl: mutation.data?.logoUrl,
    reset: mutation.reset,
  };
};

/**
 * Custom hook for fetching user metrics leaderboard.
 * Admin only. Returns ranked users by activity score.
 *
 * @param timeRange - Time range for metrics filtering (7d, 30d, 90d, all)
 * @param page - Page number for pagination
 * @param pageSize - Number of items per page
 */
export const useUserMetricsList = (
  timeRange: MetricsTimeRange = 'all',
  page: number = 1,
  pageSize: number = 20,
  options?: Omit<
    UseQueryOptions<UserMetricsListResponse, AxiosError>,
    'queryKey' | 'queryFn'
  >,
) => {
  const query = useQuery<UserMetricsListResponse, AxiosError>({
    queryKey: [AucctusQueryKeys.userMetrics, timeRange, page, pageSize],
    queryFn: async () =>
      await api.admin.getUserMetrics(timeRange, page, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    onError: (e: AxiosError) => {
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'aucctus_admin_required') {
        toast.error(
          'Permission Denied',
          'This feature is restricted to Aucctus administrators.',
        );
      } else if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'User Metrics Fetch Failed',
          message || 'Unable to fetch user metrics. Please try again.',
        );
      }
    },
    ...options,
  });

  return {
    ...query,
    users: query.data?.users ?? [],
    totalCount: query.data?.totalCount ?? 0,
    currentPage: query.data?.page ?? page,
    currentPageSize: query.data?.pageSize ?? pageSize,
    isForbidden:
      query.error && (query.error as AxiosError)?.response?.status === 403,
  };
};

/**
 * Custom hook for fetching detailed metrics for a specific user.
 * Admin only. Returns breakdown of activity for a user.
 *
 * @param userUuid - UUID of the user to get metrics for
 * @param timeRange - Time range for metrics filtering (7d, 30d, 90d, all)
 */
export const useUserMetricsDetail = (
  userUuid: string | null,
  timeRange: MetricsTimeRange = 'all',
  options?: Omit<
    UseQueryOptions<UserMetricsDetail, AxiosError>,
    'queryKey' | 'queryFn'
  >,
) => {
  const query = useQuery<UserMetricsDetail, AxiosError>({
    queryKey: [AucctusQueryKeys.userMetricsDetail, userUuid, timeRange],
    queryFn: async () =>
      await api.admin.getUserMetricsDetail(userUuid as string, timeRange),
    enabled: !!userUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    onError: (e: AxiosError) => {
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'aucctus_admin_required') {
        toast.error(
          'Permission Denied',
          'This feature is restricted to Aucctus administrators.',
        );
      } else if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'User Metrics Detail Fetch Failed',
          message || 'Unable to fetch user details. Please try again.',
        );
      }
    },
    ...options,
  });

  return {
    ...query,
    userDetail: query.data,
    hasDetail: !!query.data,
    isForbidden:
      query.error && (query.error as AxiosError)?.response?.status === 403,
  };
};

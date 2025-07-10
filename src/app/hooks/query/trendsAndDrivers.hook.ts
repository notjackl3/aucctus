import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '@libs/api';
import { toast } from '@components';
import { AucctusQueryKeys } from './query-keys';
import type {
  ICreateTrendRequest,
  IUpdateTrendRequest,
  ICreateKeyFindingRequest,
  IUpdateKeyFindingRequest,
} from '@libs/api/types/concept/trendsAndDriversV3';

// Trend Hooks
export const useGetTrends = (conceptUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.trendsAndDriversV3, conceptUuid],
    queryFn: () => api.trendsAndDriversV3.getTrends(conceptUuid),
    enabled: !!conceptUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetTrend = (conceptUuid: string, trendUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.trendV3, conceptUuid, trendUuid],
    queryFn: () => api.trendsAndDriversV3.getTrend(conceptUuid, trendUuid),
    enabled: !!conceptUuid && !!trendUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateTrend = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateTrendRequest) =>
      api.trendsAndDriversV3.createTrend(conceptUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.trendsAndDriversV3, conceptUuid],
      });
      toast.success('Trend created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create trend');
    },
  });
};

export const useUpdateTrend = (conceptUuid: string, trendUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateTrendRequest) =>
      api.trendsAndDriversV3.updateTrend(conceptUuid, trendUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.trendV3, conceptUuid, trendUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.trendsAndDriversV3, conceptUuid],
      });
      toast.success('Trend updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update trend');
    },
  });
};

export const useDeleteTrend = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trendUuid: string) =>
      api.trendsAndDriversV3.deleteTrend(conceptUuid, trendUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.trendsAndDriversV3, conceptUuid],
      });
      toast.success('Trend deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete trend');
    },
  });
};

// Key Finding Hooks
export const useGetKeyFindings = (conceptUuid: string, trendUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.keyFindingV3, conceptUuid, trendUuid],
    queryFn: () =>
      api.trendsAndDriversV3.getKeyFindings(conceptUuid, trendUuid),
    enabled: !!conceptUuid && !!trendUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateKeyFinding = (conceptUuid: string, trendUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateKeyFindingRequest) =>
      api.trendsAndDriversV3.createKeyFinding(conceptUuid, trendUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.keyFindingV3, conceptUuid, trendUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.trendV3, conceptUuid, trendUuid],
      });
      toast.success('Key finding created successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create key finding',
      );
    },
  });
};

export const useUpdateKeyFinding = (
  conceptUuid: string,
  trendUuid: string,
  keyFindingUuid: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IUpdateKeyFindingRequest) =>
      api.trendsAndDriversV3.updateKeyFinding(
        conceptUuid,
        trendUuid,
        keyFindingUuid,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.keyFindingV3, conceptUuid, trendUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.trendV3, conceptUuid, trendUuid],
      });
      toast.success('Key finding updated successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update key finding',
      );
    },
  });
};

export const useDeleteKeyFinding = (conceptUuid: string, trendUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyFindingUuid: string) =>
      api.trendsAndDriversV3.deleteKeyFinding(
        conceptUuid,
        trendUuid,
        keyFindingUuid,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.keyFindingV3, conceptUuid, trendUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.trendV3, conceptUuid, trendUuid],
      });
      toast.success('Key finding deleted successfully');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete key finding',
      );
    },
  });
};

// Bulk operations
export const useGetAllTrendsForConcept = (conceptUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.trendsAndDriversV3, 'allTrends', conceptUuid],
    queryFn: () => api.trendsAndDriversV3.getAllTrendsForConcept(conceptUuid),
    enabled: !!conceptUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

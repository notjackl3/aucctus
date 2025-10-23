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
      toast.successAnimated(
        'Trend Created',
        'Your trend has been added successfully',
      );
    },
    onError: (error: any) => {
      toast.errorAnimated(
        'Trend Creation Failed',
        error?.response?.data?.message || 'Unable to create trend',
      );
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
      toast.successAnimated(
        'Trend Updated',
        'Your trend has been updated successfully',
      );
    },
    onError: (error: any) => {
      toast.errorAnimated(
        'Trend Update Failed',
        error?.response?.data?.message || 'Unable to update trend',
      );
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
      toast.successAnimated(
        'Trend Deleted',
        'Your trend has been removed successfully',
      );
    },
    onError: (error: any) => {
      toast.errorAnimated(
        'Trend Deletion Failed',
        error?.response?.data?.message || 'Unable to delete trend',
      );
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
      toast.successAnimated(
        'Key Finding Created',
        'Your key finding has been added successfully',
      );
    },
    onError: (error: any) => {
      toast.errorAnimated(
        'Key Finding Creation Failed',
        error?.response?.data?.message || 'Unable to create key finding',
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
      toast.successAnimated(
        'Key Finding Updated',
        'Your key finding has been updated successfully',
      );
    },
    onError: (error: any) => {
      toast.errorAnimated(
        'Key Finding Update Failed',
        error?.response?.data?.message || 'Unable to update key finding',
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
      toast.successAnimated(
        'Key Finding Deleted',
        'Your key finding has been removed successfully',
      );
    },
    onError: (error: any) => {
      toast.errorAnimated(
        'Key Finding Deletion Failed',
        error?.response?.data?.message || 'Unable to delete key finding',
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

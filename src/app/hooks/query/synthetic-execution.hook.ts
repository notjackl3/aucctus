import { useMutation, useQuery } from 'react-query';
import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import {
  IDistributionPreviewRequest,
  ISyntheticExecutionRequest,
} from '@libs/api/types/concept/testing';

export const useSyntheticExecutionStart = (
  conceptUuid: string,
  testUuid: string,
) => {
  return useMutation({
    mutationFn: async (data?: ISyntheticExecutionRequest) =>
      api.testing.executeSyntheticTest(conceptUuid, testUuid, data),
    onError: (e: any) => {
      // Handle 409 Conflict specifically - execution already running
      if (e?.response?.status === 409) {
        toast.error(
          'A synthetic execution is already running for this test. Please wait for it to complete before starting a new one.',
        );
        return;
      }

      // Handle other errors with generic parsing
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to start synthetic execution');
    },
  });
};

export const useSyntheticExecutionCancel = (
  conceptUuid: string,
  testUuid: string,
) => {
  return useMutation({
    mutationFn: async (executionId: string) =>
      api.testing.cancelSyntheticExecution(conceptUuid, testUuid, executionId),
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to cancel execution');
    },
  });
};

export const useSyntheticExecutionStatus = (
  conceptUuid: string,
  testUuid: string,
  executionId?: string,
) => {
  return useMutation({
    mutationFn: async () => {
      if (!executionId) throw new Error('No execution ID provided');
      return api.testing.getSyntheticExecutionStatus(
        conceptUuid,
        testUuid,
        executionId,
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      // Status polling errors are expected when execution is not running
      // No need to show error to user, just log for debugging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to get execution status:', message);
      }
    },
  });
};

export const useSyntheticExecutionHistory = (
  conceptUuid: string,
  testUuid: string,
) => {
  return useMutation({
    mutationFn: async (limit: number = 10) =>
      api.testing.getSyntheticExecutionHistory(conceptUuid, testUuid, limit),
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to get execution history:', message);
      }
    },
  });
};

// Distribution preview hook
export const useSyntheticDistributionPreview = (
  conceptUuid: string,
  testUuid: string,
) => {
  return useMutation({
    mutationFn: async (data: IDistributionPreviewRequest) =>
      api.testing.getDistributionPreview(conceptUuid, testUuid, data),
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to generate distribution preview');
    },
  });
};

// Test collaterals query hook
export const useTestCollaterals = (conceptUuid: string, testUuid: string) => {
  return useQuery({
    queryKey: ['testCollaterals', conceptUuid, testUuid],
    queryFn: async () => api.testing.getTestCollaterals(conceptUuid, testUuid),
    enabled: !!conceptUuid && !!testUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to get test collaterals:', message);
      }
    },
  });
};

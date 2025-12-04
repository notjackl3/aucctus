import { useMutation, useQuery } from 'react-query';
import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import telemetry from '@libs/telemetry';
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
    onSuccess: () => {
      // toast.success(
      //   'Test Started',
      //   "Your synthetic test is now running. You'll be notified when it completes",
      // );
    },
    onError: (e: any) => {
      // Handle 409 Conflict specifically - execution already running
      if (e?.response?.status === 409) {
        toast.error(
          'Test Already Running',
          'A synthetic execution is already running for this test. Please wait for it to complete',
        );
        return;
      }

      // Handle other errors with generic parsing
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Test Start Failed',
        message || 'Unable to start synthetic execution. Please try again',
      );
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
    onSuccess: (data) => {
      // Check if the task was already cancelled/completed (no_tasks_found)
      if (data?.revokedTasks?.status === 'no_tasks_found') {
        telemetry.log('synthetic.execution.cancel.already_cancelled', {
          conceptUuid,
          testUuid,
          executionId: data.executionId,
          message: 'Task was already cancelled or completed',
        });
        toast.success(
          'Already Cancelled',
          'This execution was already cancelled or completed',
        );
      } else {
        telemetry.log('synthetic.execution.cancel.success', {
          conceptUuid,
          testUuid,
          executionId: data.executionId,
          revokedTasksCount: data.revokedTasks?.length || 0,
        });
      }
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Cancellation Failed',
        message || 'Unable to cancel execution. Please try again',
      );
    },
  });
};

export const useSyntheticExecutionStatus = (
  conceptUuid: string,
  testUuid: string,
  executionId?: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
    isWebSocketActive?: boolean; // New option to indicate WebSocket state
    onExecutionNotFound?: () => void; // Callback when execution is 404'd (cancelled/expired)
  },
) => {
  return useQuery({
    queryKey: ['syntheticExecutionStatus', conceptUuid, testUuid, executionId],
    queryFn: async () => {
      if (!executionId) return null;
      return api.testing.getSyntheticExecutionStatus(
        conceptUuid,
        testUuid,
        executionId,
      );
    },
    enabled:
      !!conceptUuid &&
      !!testUuid &&
      !!executionId &&
      options?.enabled !== false,
    refetchInterval: (() => {
      if (options?.refetchInterval !== undefined) {
        return options.refetchInterval;
      }
      // Adjust polling based on WebSocket activity
      if (options?.isWebSocketActive) {
        return 5000; // Slower polling when WebSocket is active
      }
      return 2000; // Faster polling when WebSocket is not active
    })(),
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (execution not found) or 403 (access denied)
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    onError: (e: any) => {
      // A 404 means the execution doesn't exist or has expired (cancelled)
      if (e?.response?.status === 404) {
        telemetry.log('synthetic.execution.polling.not_found', {
          conceptUuid,
          testUuid,
          executionId,
          message: 'Execution not found - treating as cancelled/expired',
        });
        // Call the callback to reset execution state
        options?.onExecutionNotFound?.();
      } else {
        // Status polling errors are expected when execution is not running
        // No need to show error to user, just log for debugging
        if (process.env.NODE_ENV === 'development') {
          const message = utils.osiris.parseFormError(e);
          // eslint-disable-next-line no-console
          console.error('Failed to get execution status:', message);
        }
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
      toast.error(
        'Preview Generation Failed',
        message || 'Unable to generate distribution preview. Please try again',
      );
    },
  });
};

// Test collaterals query hook
export const useTestCollaterals = (conceptUuid: string, testUuid: string) => {
  const query = useQuery({
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

  return {
    ...query,
    collaterals: query.data || [],
  };
};

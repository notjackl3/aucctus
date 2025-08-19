import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';
import {
  ITestDetailsCreate,
  ITestDetailsUpdate,
  ITestCollateralCreate,
  ITestCollateralUpdate,
  ITestParticipantCreate,
  ITestParticipantUpdate,
  ITestResultCreate,
  ITestResultUpdate,
  ITestAssumptionCreate,
  ITestAssumptionUpdate,
} from '@pages/Concept/Report/Testing/types';
import { useState } from 'react';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import {
  ITestCollateralProgressMessage,
  ITestCollateralCompletedMessage,
  ITestCollateralErrorMessage,
} from '@libs/api/types/socketMessages/inbound';

/**
 * Custom hook for fetching test details for a concept.
 * @param conceptUuid - The UUID of the concept.
 * @returns The result of the useQuery hook.
 */
export const useTestDetails = (conceptUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.testDetails, conceptUuid],
    queryFn: async () => await api.testing.getTestDetails(conceptUuid),
    enabled: !!conceptUuid,
    staleTime: 1000 * 30, // 30 seconds - shorter for more frequent updates
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch when component mounts
  });

  return { ...query, testDetails: query.data?.results || [] };
};

/**
 * Custom hook for fetching a specific test detail.
 * @param conceptUuid - The UUID of the concept.
 * @param testUuid - The UUID of the test.
 * @returns The result of the useQuery hook.
 */
export const useTestDetail = (conceptUuid: string, testUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.testDetail, conceptUuid, testUuid],
    queryFn: async () => await api.testing.getTestDetail(conceptUuid, testUuid),
    enabled: !!conceptUuid && !!testUuid,
    staleTime: 1000 * 30, // 30 seconds - shorter for more frequent updates
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Always refetch when component mounts
  });

  return { ...query, testDetail: query.data };
};

/**
 * Custom hook for creating a new test.
 * @returns The result of the useMutation hook.
 */
export const useCreateTestDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      data: ITestDetailsCreate;
    }) => {
      const { conceptUuid, data } = params;
      return await api.testing.createTestDetails(conceptUuid, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testDetails, variables.conceptUuid],
      });
      toast.success('Test created successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to create test. Please try again.');
    },
  });
};

/**
 * Custom hook for updating test details.
 * @returns The result of the useMutation hook.
 */
export const useUpdateTestDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      data: ITestDetailsUpdate;
    }) => {
      const { conceptUuid, testUuid, data } = params;
      return await api.testing.updateTestDetail(conceptUuid, testUuid, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testDetails, variables.conceptUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testDetail,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Test updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update test. Please try again.');
    },
  });
};

/**
 * Custom hook for completing test details.
 * @returns The result of the useMutation hook.
 */
export const useCompleteTestDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { conceptUuid: string; testUuid: string }) => {
      const { conceptUuid, testUuid } = params;
      return await api.testing.completeTestDetails(conceptUuid, testUuid);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testDetails, variables.conceptUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testDetail,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success(
        'Test completed successfully! A new test has been generated.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to complete test. Please try again.');
    },
  });
};

/**
 * Custom hook for deleting test details.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { conceptUuid: string; testUuid: string }) => {
      const { conceptUuid, testUuid } = params;
      return await api.testing.deleteTestDetail(conceptUuid, testUuid);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testDetails, variables.conceptUuid],
      });
      toast.success('Test deleted successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to delete test. Please try again.');
    },
  });
};

/**
 * Custom hook for fetching test collateral.
 * @param conceptUuid - The UUID of the concept.
 * @param testUuid - The UUID of the test.
 * @param options - Additional query options.
 * @returns The result of the useQuery hook.
 */
export const useTestCollateral = (
  conceptUuid: string,
  testUuid: string,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.testCollateral, conceptUuid, testUuid],
    queryFn: async () =>
      await api.testing.getTestCollateral(conceptUuid, testUuid),
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!conceptUuid && !!testUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
  });

  return { ...query, collateral: query.data?.results || [] };
};

/**
 * Creates test collateral with WebSocket progress tracking.
 * @returns Mutation with processingState and clearProcessingState
 */
export const useCreateTestCollateral = () => {
  const queryClient = useQueryClient();
  const [processingState, setProcessingState] = useState<{
    isProcessing: boolean;
    progress: number;
    message: string;
    stage?: string;
    error: string | null;
    collateralUuid?: string;
  }>({
    isProcessing: false,
    progress: 0,
    message: '',
    stage: undefined,
    error: null,
    collateralUuid: undefined,
  });

  // Listen for WebSocket events for collateral creation progress
  useSocketEvent(
    'test_collateral.progress.user',
    (data: ITestCollateralProgressMessage) => {
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: data.progress,
        message: data.message,
        stage: data.stage,
        error: null,
        collateralUuid: data.collateralUuid,
      }));
    },
  );

  // Listen for completion event
  useSocketEvent(
    'test_collateral.completed.user',
    (data: ITestCollateralCompletedMessage) => {
      setProcessingState({
        isProcessing: false,
        progress: 100,
        message: 'Collateral created successfully!',
        stage: 'completed',
        error: null,
        collateralUuid: data.collateralUuid,
      });

      // Invalidate queries to refresh the collateral list
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testCollateral,
          data.conceptUuid,
          data.testUuid,
        ],
      });

      toast.success('Collateral created successfully');
    },
  );

  // Listen for error events
  useSocketEvent(
    'test_collateral.error.user',
    (data: ITestCollateralErrorMessage) => {
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        progress: 0,
        message: '',
        stage: 'error',
        error: data.message,
        collateralUuid: data.collateralUuid || prev.collateralUuid,
      }));

      toast.error(data.message || 'Failed to create collateral');
    },
  );

  const mutation = useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      data: ITestCollateralCreate;
    }) => {
      const { conceptUuid, testUuid, data } = params;

      // Set initial processing state
      setProcessingState({
        isProcessing: true,
        progress: 0,
        message: 'Starting collateral creation...',
        stage: 'starting',
        error: null,
        collateralUuid: undefined,
      });

      return await api.testing.createTestCollateral(
        conceptUuid,
        testUuid,
        data,
      );
    },
    onSuccess: () => {
      // Initiates async processing. WebSocket events handle progress updates.
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      setProcessingState({
        isProcessing: false,
        progress: 0,
        message: '',
        stage: 'error',
        error: message || 'Failed to create collateral. Please try again.',
        collateralUuid: undefined,
      });
      toast.error(message || 'Failed to create collateral. Please try again.');
    },
  });

  return {
    ...mutation,
    processingState,
    clearProcessingState: () =>
      setProcessingState({
        isProcessing: false,
        progress: 0,
        message: '',
        stage: undefined,
        error: null,
        collateralUuid: undefined,
      }),
  };
};

/**
 * Custom hook for updating test collateral.
 * @returns The result of the useMutation hook.
 */
export const useUpdateTestCollateral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      collateralUuid: string;
      data: ITestCollateralUpdate;
    }) => {
      const { conceptUuid, testUuid, collateralUuid, data } = params;
      return await api.testing.updateTestCollateral(
        conceptUuid,
        testUuid,
        collateralUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testCollateral,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Collateral updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update collateral. Please try again.');
    },
  });
};

/**
 * Custom hook for deleting test collateral.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestCollateral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      collateralUuid: string;
    }) => {
      const { conceptUuid, testUuid, collateralUuid } = params;
      return await api.testing.deleteTestCollateral(
        conceptUuid,
        testUuid,
        collateralUuid,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testCollateral,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Collateral deleted successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to delete collateral. Please try again.');
    },
  });
};

/**
 * Custom hook for fetching test participants.
 * @param conceptUuid - The UUID of the concept.
 * @param testUuid - The UUID of the test.
 * @param options - Additional query options.
 * @returns The result of the useQuery hook.
 */
export const useTestParticipants = (
  conceptUuid: string,
  testUuid: string,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.testParticipants, conceptUuid, testUuid],
    queryFn: async () =>
      await api.testing.getTestParticipants(conceptUuid, testUuid),
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!conceptUuid && !!testUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
  });

  return { ...query, participants: query.data?.results || [] };
};

/**
 * Custom hook for creating test participants.
 * @returns The result of the useMutation hook.
 */
export const useCreateTestParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      data: ITestParticipantCreate;
    }) => {
      const { conceptUuid, testUuid, data } = params;
      return await api.testing.createTestParticipant(
        conceptUuid,
        testUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testParticipants,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Participant added successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to add participant. Please try again.');
    },
  });
};

/**
 * Custom hook for updating test participants.
 * @returns The result of the useMutation hook.
 */
export const useUpdateTestParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      participantUuid: string;
      data: ITestParticipantUpdate;
    }) => {
      const { conceptUuid, testUuid, participantUuid, data } = params;
      return await api.testing.updateTestParticipant(
        conceptUuid,
        testUuid,
        participantUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testParticipants,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Participant updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update participant. Please try again.');
    },
  });
};

/**
 * Custom hook for deleting test participants.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      participantUuid: string;
    }) => {
      const { conceptUuid, testUuid, participantUuid } = params;
      return await api.testing.deleteTestParticipant(
        conceptUuid,
        testUuid,
        participantUuid,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testParticipants,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Participant removed successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to remove participant. Please try again.');
    },
  });
};

/**
 * Custom hook for fetching test results.
 * @param conceptUuid - The UUID of the concept.
 * @param testUuid - The UUID of the test.
 * @param options - Additional query options.
 * @returns The result of the useQuery hook.
 */
export const useTestResults = (
  conceptUuid: string,
  testUuid: string,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.testResults, conceptUuid, testUuid],
    queryFn: async () =>
      await api.testing.getTestResults(conceptUuid, testUuid),
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!conceptUuid && !!testUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
  });

  return { ...query, results: query.data?.results || [] };
};

/**
 * Custom hook for creating test results.
 * @returns The result of the useMutation hook.
 */
export const useCreateTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      data: ITestResultCreate;
    }) => {
      const { conceptUuid, testUuid, data } = params;
      return await api.testing.createTestResult(conceptUuid, testUuid, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testResults,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Result uploaded successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to upload result. Please try again.');
    },
  });
};

/**
 * Custom hook for creating test results with file upload.
 * @returns The result of the useMutation hook.
 */
export const useCreateTestResultWithFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      file: File;
      summary?: string;
      recommendations?: string;
    }) => {
      const { conceptUuid, testUuid, file, summary, recommendations } = params;
      return await api.testing.createTestResultWithFile(
        conceptUuid,
        testUuid,
        file,
        summary,
        recommendations,
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate test results query
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testResults,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });

      // Invalidate test detail query since results can update assumptions validation status
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testDetail,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });

      // Invalidate test details list query
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testDetails, variables.conceptUuid],
      });

      toast.success('File uploaded successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to upload file. Please try again.');
    },
  });
};

/**
 * Custom hook for updating test results.
 * @returns The result of the useMutation hook.
 */
export const useUpdateTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      resultUuid: string;
      data: ITestResultUpdate;
    }) => {
      const { conceptUuid, testUuid, resultUuid, data } = params;
      return await api.testing.updateTestResult(
        conceptUuid,
        testUuid,
        resultUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testResults,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Result updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update result. Please try again.');
    },
  });
};

/**
 * Custom hook for deleting test results.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      resultUuid: string;
    }) => {
      const { conceptUuid, testUuid, resultUuid } = params;
      return await api.testing.deleteTestResult(
        conceptUuid,
        testUuid,
        resultUuid,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testResults,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Result deleted successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to delete result. Please try again.');
    },
  });
};

/**
 * Custom hook for fetching test assumptions.
 * @param conceptUuid - The UUID of the concept.
 * @param testUuid - The UUID of the test.
 * @param options - Additional query options.
 * @returns The result of the useQuery hook.
 */
export const useTestAssumptions = (
  conceptUuid: string,
  testUuid: string,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.testAssumptions, conceptUuid, testUuid],
    queryFn: async () =>
      await api.testing.getTestAssumptions(conceptUuid, testUuid),
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!conceptUuid && !!testUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
  });

  return { ...query, assumptions: query.data?.results || [] };
};

/**
 * Custom hook for creating test assumptions.
 * @returns The result of the useMutation hook.
 */
export const useCreateTestAssumption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      data: ITestAssumptionCreate;
    }) => {
      const { conceptUuid, testUuid, data } = params;
      return await api.testing.createTestAssumption(
        conceptUuid,
        testUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testAssumptions,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Assumption linked successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to link assumption. Please try again.');
    },
  });
};

/**
 * Custom hook for updating test assumptions.
 * @returns The result of the useMutation hook.
 */
export const useUpdateTestAssumption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      assumptionUuid: string;
      data: ITestAssumptionUpdate;
    }) => {
      const { conceptUuid, testUuid, assumptionUuid, data } = params;
      return await api.testing.updateTestAssumption(
        conceptUuid,
        testUuid,
        assumptionUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testAssumptions,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testDetail,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.testDetails, variables.conceptUuid],
      });
      toast.success('Assumption validation updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to update assumption validation. Please try again.',
      );
    },
  });
};

/**
 * Custom hook for deleting test assumptions.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestAssumption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      assumptionUuid: string;
    }) => {
      const { conceptUuid, testUuid, assumptionUuid } = params;
      return await api.testing.deleteTestAssumption(
        conceptUuid,
        testUuid,
        assumptionUuid,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testAssumptions,
          variables.conceptUuid,
          variables.testUuid,
        ],
      });
      toast.success('Assumption unlinked successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to unlink assumption. Please try again.');
    },
  });
};

/**
 * Hook for handling custom test collateral requests with smart type detection
 */
export const useTestCollateralRequest = (
  conceptUuid: string,
  testUuid: string,
) => {
  const [customRequest, setCustomRequest] = useState('');
  const createTestCollateral = useCreateTestCollateral();

  /**
   * Handle custom collateral request submission
   */
  const handleCustomRequest = () => {
    if (!customRequest.trim() || !conceptUuid || !testUuid) return;

    createTestCollateral.mutate(
      {
        conceptUuid,
        testUuid,
        data: {
          title: `Custom Collateral Request`,
          description: `User requested: ${customRequest}`,
          content: customRequest,
          test_details_uuid: testUuid,
        },
      },
      {
        onSuccess: () => {
          toast.success('Collateral request submitted successfully!');
          setCustomRequest(''); // Clear input on success
        },
        onError: (error) => {
          const errorMessage = utils.osiris.parseFormError(error);
          toast.error(errorMessage || 'Failed to submit collateral request');
        },
      },
    );
  };

  /**
   * Handle Enter key press
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomRequest();
    }
  };

  return {
    customRequest,
    setCustomRequest,
    handleCustomRequest,
    handleKeyDown,
    isLoading: createTestCollateral.isLoading,
  };
};

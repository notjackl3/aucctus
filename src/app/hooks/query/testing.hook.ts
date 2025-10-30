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
  ITestCollateralUpdateProgressMessage,
  ITestCollateralUpdateCompletedMessage,
  ITestCollateralUpdateErrorMessage,
} from '@libs/api/types/socketMessages/inbound';
import useStore from '@stores/store';

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
export const useTestDetail = (
  conceptUuid: string,
  testUuid: string,
  options?: { enabled?: boolean },
) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.testDetail, conceptUuid, testUuid],
    queryFn: async () => {
      const result = await api.testing.getTestDetail(conceptUuid, testUuid);
      return result;
    },
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : !!conceptUuid && !!testUuid,
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
      toast.success('Test Created', 'Your test has been created successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Test Creation Failed',
        message || 'Unable to create test. Please try again',
      );
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
      toast.success('Test Updated', 'Your test has been updated successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Test Update Failed',
        message || 'Unable to update test. Please try again',
      );
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
      toast.completed(
        'Test Completed',
        'A new test has been generated for you',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Test Completion Failed',
        message || 'Unable to complete test. Please try again',
      );
    },
  });
};

/**
 * Custom hook for reverting a completed test back to active status.
 * @returns The result of the useMutation hook.
 */
export const useRevertTestDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { conceptUuid: string; testUuid: string }) => {
      const { conceptUuid, testUuid } = params;
      return await api.testing.revertTestDetails(conceptUuid, testUuid);
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
        'Test Reverted',
        'The test has been moved back to active status. Your previous active test was removed.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Test Revert Failed',
        message || 'Unable to revert test. Please try again',
      );
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
      toast.success('Test Deleted', 'Your test has been removed successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Test Deletion Failed',
        message || 'Unable to delete test. Please try again',
      );
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
    staleTime: 0, // 2 minutes
    cacheTime: 0, // 2 minutes
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

      toast.success(
        'Collateral Created',
        'Test collateral has been added successfully',
      );
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

      toast.error(
        'Collateral Creation Failed',
        data.message || 'Unable to create collateral',
      );
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
      toast.error(
        'Collateral Creation Failed',
        message || 'Unable to create collateral. Please try again',
      );
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
 * Upload user-provided image collateral.
 */
export const useUploadTestCollateralImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      file: File;
      title?: string;
      description?: string;
      order?: number;
    }) => {
      const { conceptUuid, testUuid, file, title, description, order } = params;

      return await api.testing.uploadTestCollateralImage(
        conceptUuid,
        testUuid,
        file,
        {
          title,
          description,
          order,
        },
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
      toast.success('Collateral uploaded successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to upload collateral. Please try again.');
    },
  });
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
      toast.success(
        'Collateral Updated',
        'Test collateral has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Collateral Update Failed',
        message || 'Unable to update collateral. Please try again',
      );
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
      toast.success(
        'Collateral Deleted',
        'Test collateral has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Collateral Deletion Failed',
        message || 'Unable to delete collateral. Please try again',
      );
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
      toast.success(
        'Participant Added',
        'Test participant has been added successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Participant Addition Failed',
        message || 'Unable to add participant. Please try again',
      );
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
      toast.success(
        'Participant Updated',
        'Test participant has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Participant Update Failed',
        message || 'Unable to update participant. Please try again',
      );
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
      toast.success(
        'Participant Removed',
        'Test participant has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Participant Removal Failed',
        message || 'Unable to remove participant. Please try again',
      );
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
      toast.success(
        'Result Uploaded',
        'Test result has been uploaded successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Result Upload Failed',
        message || 'Unable to upload result. Please try again',
      );
    },
  });
};

/**
 * Custom hook for creating test results with multiple files upload.
 * @returns The result of the useMutation hook.
 */
export const useCreateTestResultWithFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      files: File[];
      summary?: string;
      recommendations?: string;
    }) => {
      const { conceptUuid, testUuid, files, summary, recommendations } = params;
      return await api.testing.createTestResultWithFiles(
        conceptUuid,
        testUuid,
        files,
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

      toast.success(
        'Files Uploaded',
        `${variables.files.length} file${variables.files.length > 1 ? 's' : ''} uploaded successfully`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'File Upload Failed',
        message || 'Unable to upload files. Please try again',
      );
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
      files?: File[]; // Optional files parameter
    }) => {
      const { conceptUuid, testUuid, resultUuid, data, files } = params;

      // If files are provided, use the files upload method
      if (files && files.length > 0) {
        return await api.testing.addFilesToTestResult(
          conceptUuid,
          testUuid,
          resultUuid,
          files,
          {
            summary: data.description, // Map description to summary if needed
          },
        );
      }

      // Otherwise, use the regular update method
      return await api.testing.updateTestResult(
        conceptUuid,
        testUuid,
        resultUuid,
        data,
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

      // If files were uploaded, also invalidate other related queries
      if (variables.files && variables.files.length > 0) {
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

        toast.success(
          'Result Updated',
          `Added ${variables.files.length} additional file${variables.files.length > 1 ? 's' : ''} to result`,
        );
      } else {
        toast.success(
          'Result Updated',
          'Test result has been updated successfully',
        );
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Result Update Failed',
        message || 'Unable to update result. Please try again',
      );
    },
  });
};

/**
 * Custom hook for adding files to existing test results.
 * @returns The result of the useMutation hook.
 */
export const useUpdateTestResultWithFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      resultUuid: string;
      files: File[];
      data?: { summary?: string; recommendations?: string };
    }) => {
      const { conceptUuid, testUuid, resultUuid, files, data } = params;
      return await api.testing.addFilesToTestResult(
        conceptUuid,
        testUuid,
        resultUuid,
        files,
        data,
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

      toast.success(
        'Files Added',
        `Added ${variables.files.length} file${variables.files.length > 1 ? 's' : ''} to result`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'File Addition Failed',
        message || 'Unable to update result with files. Please try again',
      );
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
      toast.success(
        'Result Deleted',
        'Test result has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Result Deletion Failed',
        message || 'Unable to delete result. Please try again',
      );
    },
  });
};

/**
 * Custom hook for deleting a test result without showing individual toast notifications.
 * Useful for bulk operations where you want to show one final toast instead of multiple.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestResultSilent = () => {
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
      // No toast notification for silent deletion
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Still show error toasts since those are important
      toast.error(
        'Result Deletion Failed',
        message || 'Unable to delete result. Please try again',
      );
    },
  });
};

/**
 * Custom hook for deleting test result files.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestResultFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      resultUuid: string;
      fileUuid: string;
    }) => {
      const { conceptUuid, testUuid, resultUuid, fileUuid } = params;
      return await api.testing.deleteTestResultFile(
        conceptUuid,
        testUuid,
        resultUuid,
        fileUuid,
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
      toast.success(
        'File Deleted',
        'Test result file has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'File Deletion Failed',
        message || 'Unable to delete file. Please try again',
      );
    },
  });
};

/**
 * Custom hook for deleting test result files without showing individual toast notifications.
 * Useful for bulk operations where you want to show one final toast instead of multiple.
 * @returns The result of the useMutation hook.
 */
export const useDeleteTestResultFileSilent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      resultUuid: string;
      fileUuid: string;
    }) => {
      const { conceptUuid, testUuid, resultUuid, fileUuid } = params;
      return await api.testing.deleteTestResultFile(
        conceptUuid,
        testUuid,
        resultUuid,
        fileUuid,
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
      // No toast notification for silent deletion
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Still show error toasts since those are important
      toast.error(
        'File Deletion Failed',
        message || 'Unable to delete file. Please try again',
      );
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
      toast.success(
        'Assumption Linked',
        'Test assumption has been linked successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Link Failed',
        message || 'Unable to link assumption. Please try again',
      );
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
      toast.success(
        'Validation Updated',
        'Assumption validation has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Validation Update Failed',
        message || 'Unable to update assumption validation. Please try again',
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
      toast.success(
        'Assumption Unlinked',
        'Test assumption has been unlinked successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Unlink Failed',
        message || 'Unable to unlink assumption. Please try again',
      );
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
          toast.success(
            'Request Submitted',
            'Your collateral request has been submitted successfully',
          );
          setCustomRequest(''); // Clear input on success
        },
        onError: (error) => {
          const errorMessage = utils.osiris.parseFormError(error);
          toast.error(
            'Request Submission Failed',
            errorMessage || 'Unable to submit collateral request',
          );
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

/**
 * Hook for managing all test collateral feedback states with store persistence.
 * @returns Methods to manage feedback states for all collateral items in a test
 */
export const useTestCollateralManager = (
  conceptUuid: string,
  testUuid: string,
  onFeedbackSuccess?: (updatedData: any) => void,
) => {
  const queryClient = useQueryClient();
  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>(
    {},
  );

  // Use store for persistent processing state
  const store = useStore();
  const testCollateral = store.testCollateral || {
    collateralFeedbackStates: {},
  };

  // Get all processing states for this test
  const getAllProcessingStates = () => {
    return testCollateral?.collateralFeedbackStates || {};
  };

  // Get processing state for specific collateral
  const getProcessingState = (collateralUuid: string) => {
    return (
      testCollateral?.collateralFeedbackStates?.[collateralUuid] || {
        isProcessing: false,
        progress: 0,
        message: '',
        stage: undefined,
        error: null,
        collateralUuid: undefined,
      }
    );
  };

  // Set processing state for specific collateral
  const setProcessingState = (collateralUuid: string, state: any) => {
    if (store.testCollateral?.setCollateralFeedbackProcessingState) {
      store.testCollateral.setCollateralFeedbackProcessingState(
        collateralUuid,
        state,
      );
    }
  };

  // Clear processing state for specific collateral
  const clearProcessingState = (collateralUuid: string) => {
    if (store.testCollateral?.clearCollateralFeedbackProcessingState) {
      store.testCollateral.clearCollateralFeedbackProcessingState(
        collateralUuid,
      );
    }
  };

  // Check if collateral feedback processing is complete based on updatedAt time
  const checkCompletedFeedback = (
    collateralUuid: string,
    currentUpdatedAt: string,
  ) => {
    if (store.testCollateral?.checkAndClearCompletedFeedback) {
      return store.testCollateral.checkAndClearCompletedFeedback(
        collateralUuid,
        currentUpdatedAt,
      );
    }
    return false;
  };

  // Feedback text management
  const getFeedbackText = (collateralUuid: string) => {
    return feedbackTexts[collateralUuid] || '';
  };

  const setFeedbackText = (collateralUuid: string, text: string) => {
    setFeedbackTexts((prev) => ({ ...prev, [collateralUuid]: text }));
  };

  // Listen for WebSocket events for collateral update progress
  useSocketEvent(
    'test_collateral.update.progress.user',
    (data: ITestCollateralUpdateProgressMessage) => {
      if (data.collateralUuid) {
        setProcessingState(data.collateralUuid, {
          isProcessing: true,
          progress: data.progress,
          message: data.message,
          stage: data.stage,
          error: null,
          collateralUuid: data.collateralUuid,
        });
      }
    },
  );

  // Listen for completion event
  useSocketEvent(
    'test_collateral.update.completed.user',
    (data: ITestCollateralUpdateCompletedMessage) => {
      if (data.collateralUuid) {
        setProcessingState(data.collateralUuid, {
          isProcessing: false,
          progress: 100,
          message: 'Feedback processed successfully!',
          stage: 'completed',
          error: null,
          collateralUuid: data.collateralUuid,
        });
        // Clear the feedback text after successful submission
        setFeedbackText(data.collateralUuid, '');
      }

      // Invalidate queries to refresh the collateral list
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.testCollateral,
          data.conceptUuid,
          data.testUuid,
        ],
      });

      toast.success(
        'Feedback Submitted',
        'Your feedback has been submitted successfully',
      );

      // Call the callback to update the selectedItem
      if (onFeedbackSuccess) {
        onFeedbackSuccess(data.collateral);
      }
    },
  );

  // Listen for error events
  useSocketEvent(
    'test_collateral.update.error.user',
    (data: ITestCollateralUpdateErrorMessage) => {
      const targetCollateralUuid = data.collateralUuid;
      if (targetCollateralUuid) {
        setProcessingState(targetCollateralUuid, {
          isProcessing: false,
          progress: 0,
          message: '',
          stage: 'error',
          error: data.message,
          collateralUuid: targetCollateralUuid,
        });
      }

      toast.error(
        'Feedback Processing Failed',
        data.message || 'Unable to process feedback',
      );
    },
  );

  const updateMutation = useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      testUuid: string;
      collateralUuid: string;
      data: ITestCollateralUpdate;
      submittedAt?: string; // Current updatedAt time before submission
    }) => {
      const { conceptUuid, testUuid, collateralUuid, data, submittedAt } =
        params;

      // Set initial processing state with the current updatedAt time
      setProcessingState(collateralUuid, {
        isProcessing: true,
        progress: 0,
        message: 'Starting feedback processing...',
        stage: 'starting',
        error: null,
        collateralUuid,
        submittedAt, // Store the updatedAt time when feedback was submitted
      });

      return await api.testing.updateTestCollateral(
        conceptUuid,
        testUuid,
        collateralUuid,
        data,
      );
    },
    onSuccess: () => {
      // Initiates async processing. WebSocket events handle progress updates.
    },
    onError: (e: AxiosError, variables) => {
      const message = utils.osiris.parseFormError(e);

      // Clear timeout since we got an error response
      clearProcessingState(variables.collateralUuid);

      // Set error state
      setProcessingState(variables.collateralUuid, {
        isProcessing: false,
        progress: 0,
        message: '',
        stage: 'error',
        error: message || 'Failed to submit feedback. Please try again.',
        collateralUuid: variables.collateralUuid,
      });

      toast.error(
        'Feedback Submission Failed',
        message || 'Unable to submit feedback. Please try again',
      );
    },
  });

  /**
   * Submit feedback for a specific collateral item
   */
  const submitFeedback = (
    collateralUuid: string,
    feedbackText: string,
    currentUpdatedAt?: string,
  ) => {
    if (!feedbackText.trim() || !conceptUuid || !testUuid || !collateralUuid)
      return;

    updateMutation.mutate({
      conceptUuid,
      testUuid,
      collateralUuid,
      data: {
        userInput: feedbackText,
      },
      submittedAt: currentUpdatedAt,
    });
  };

  /**
   * Handle Enter key press for feedback submission
   */
  const handleKeyDown = (
    collateralUuid: string,
    e: React.KeyboardEvent,
    currentUpdatedAt?: string,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const feedbackText = getFeedbackText(collateralUuid);
      if (feedbackText.trim()) {
        submitFeedback(collateralUuid, feedbackText, currentUpdatedAt);
      }
    }
  };

  return {
    // State getters
    getAllProcessingStates,
    getProcessingState,
    getFeedbackText,

    // State setters
    setFeedbackText,
    clearProcessingState,

    // Actions
    submitFeedback,
    handleKeyDown,
    checkCompletedFeedback,

    // Mutation state
    isLoading: updateMutation.isLoading,
  };
};

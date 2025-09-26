import { useSocketEvent } from '@hooks/sockets/aucctus';
import telemetry from '@libs/telemetry';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  ITestResultHandshakeMessage,
  ITestResultProcessingMessage,
  ITestResultCompletedMessage,
  ITestResultErrorMessage,
} from '@libs/api/types';
import { ITestResultProcessingState } from '../TestResultProcessingStatus';

interface UseTestResultsSocketProps {
  conceptUuid?: string;
  testUuid?: string;
  processingState: ITestResultProcessingState;
  setProcessingState: (
    state:
      | ITestResultProcessingState
      | ((prev: ITestResultProcessingState) => ITestResultProcessingState),
  ) => void;
}

export const useTestResultsSocket = ({
  conceptUuid,
  testUuid,
  processingState,
  setProcessingState,
}: UseTestResultsSocketProps) => {
  const queryClient = useQueryClient();

  // Socket event handlers for test result processing
  // NOTE: Multitenancy validation (account_uuid/user_uuid) is handled automatically by useSocketEvent hook
  useSocketEvent(
    'test.result.handshake',
    (handshake: ITestResultHandshakeMessage) => {
      telemetry.log('test.result.handshake received', {
        testResultUuid: handshake.testResultUuid,
        conceptUuid: handshake.conceptUuid,
        testUuid: handshake.testUuid,
      });

      // Validate that this message is for this specific component
      if (
        handshake.conceptUuid !== conceptUuid ||
        handshake.testUuid !== testUuid
      ) {
        telemetry.log('test.result.handshake ignored - component mismatch', {
          messageConceptUuid: handshake.conceptUuid,
          messageTestUuid: handshake.testUuid,
          componentConceptUuid: conceptUuid,
          componentTestUuid: testUuid,
        });
        return;
      }

      setProcessingState((prev) => {
        const newState = {
          ...prev,
          isProcessing: true, // Set processing to true when handshake is received
          stage: 'initializing',
          message: 'Initializing analysis...',
          progress: 0, // Start with 0 progress
          error: null,
          testResultUuid: handshake.testResultUuid,
          conceptUuid: handshake.conceptUuid,
          testUuid: handshake.testUuid,
        };

        telemetry.log('test.result.handshake state updated', {
          previousUuid: prev.testResultUuid,
          newUuid: newState.testResultUuid,
          isProcessing: true,
        });

        return newState;
      });
    },
  );

  useSocketEvent(
    'test.result.processing',
    (message: ITestResultProcessingMessage) => {
      telemetry.log('test.result.processing received', {
        testResultUuid: message.testResultUuid,
        stage: message.stage,
        progress: message.progress,
        value: message.value,
        currentStateUuid: processingState.testResultUuid,
      });

      // Log processing messages (don't invalidate at start - let enabled:false handle it)

      setProcessingState((prev) => {
        // Validate that this message is for this specific component and matches current processing
        if (
          prev.testResultUuid !== message.testResultUuid &&
          prev.testResultUuid // Only validate if we have a UUID (allow initial state)
        ) {
          telemetry.log('test.result.processing ignored - UUID mismatch', {
            messageUuid: message.testResultUuid,
            stateUuid: prev.testResultUuid,
          });
          return prev;
        }

        // Determine if processing should be active
        // If message.value is explicitly false, processing is inactive
        // If message.value is true or undefined, check for progress/stage indicators
        const isActivelyProcessing =
          message.value === false
            ? false
            : message.value === true ||
              message.progress !== undefined ||
              Boolean(message.stage);

        const newState = {
          ...prev,
          testResultUuid: message.testResultUuid, // Ensure UUID is set
          isProcessing: isActivelyProcessing,
          stage: message.stage,
          progress:
            message.progress !== undefined ? message.progress : prev.progress, // Handle progress 0 properly
          message: `Processing: ${message.stage?.replace(/_/g, ' ') || prev.stage?.replace(/_/g, ' ') || 'in progress'}`,
          error: null,
        };

        telemetry.log('test.result.processing state updated', {
          newState: newState,
          messageUuid: message.testResultUuid,
          progress: message.progress,
          isProcessing: isActivelyProcessing,
          messageValue: message.value,
        });

        return newState;
      });
    },
  );

  useSocketEvent(
    'test.result.completed',
    (message: ITestResultCompletedMessage) => {
      telemetry.log('test.result.completed received', {
        testResultUuid: message.testResultUuid,
        summary: message.summary,
        learningsCount: message.learnings.length,
        keywordsCount: message.keywords.length,
      });

      if (processingState.testResultUuid === message.testResultUuid) {
        setProcessingState((prev) => ({
          ...prev,
          isProcessing: false,
          stage: 'completed',
          progress: 100,
          message: 'Analysis complete',
          summary: message.summary,
          learnings: message.learnings,
          keywords: message.keywords,
          error: null,
        }));

        // Refetch test results to show learnings in the main UI
        telemetry.log('test.result.completed invalidating queries', {
          conceptUuid,
          testUuid,
          testResultUuid: message.testResultUuid,
        });

        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testResults, conceptUuid, testUuid],
        });

        // Also invalidate test detail to refresh affirming/challenging findings
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testDetail, conceptUuid, testUuid],
        });
      }
    },
  );

  useSocketEvent('test.result.error', (message: ITestResultErrorMessage) => {
    telemetry.error('test.result.error received', {
      testResultUuid: message.testResultUuid,
      code: message.code,
      message: message.message,
    });

    if (processingState.testResultUuid === message.testResultUuid) {
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        stage: 'error',
        progress: 0,
        error: message.message,
      }));
    }
  });
};

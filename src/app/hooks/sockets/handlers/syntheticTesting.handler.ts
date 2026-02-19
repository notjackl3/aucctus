import React from 'react';
import { toast } from '@components';
import { useSocketEvent } from '../aucctus';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import api from '@libs/api';
import type { ProgressToastPayload } from '@components/Notification/toast';
import type {
  ISyntheticExecutionProgressMessage,
  ISyntheticExecutionErrorMessage,
} from '@libs/api/types';
import { conceptWorkflowToasts } from './toast-utils';
import type { ConceptWorkflowToastRecord } from './toast-utils';

export const useSyntheticTestingHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  // Helper function to create/update synthetic execution toast
  const upsertSyntheticToast = React.useCallback(
    (data: {
      conceptUuid: string;
      testUuid: string;
      executionId: string;
      progress: number;
      message: string;
      startTime?: number;
      conceptTitle?: string;
    }) => {
      const toastKey = `${data.conceptUuid}-${data.testUuid}`;
      const existing = conceptWorkflowToasts.get(toastKey);

      const startTime =
        data.progress === 0
          ? Date.now()
          : (data.startTime ?? existing?.data.startTime ?? Date.now());

      telemetry.debug('synthetic.toast.startTime', {
        toastKey,
        progress: data.progress,
        startTime,
        existingStartTime: existing?.data.startTime,
        isReset: data.progress === 0,
      });

      const handleCancel = async () => {
        try {
          await api.testing.cancelSyntheticExecution(
            data.conceptUuid,
            data.testUuid,
            data.executionId,
          );
          const toastRecord = conceptWorkflowToasts.get(toastKey);
          if (toastRecord) {
            toast.dismiss(toastRecord.toastId);
            conceptWorkflowToasts.delete(toastKey);
          }
          useStore.getState().syntheticTesting.setLastExecutionState(null);
        } catch (error) {
          toast.error('Cancellation Failed', 'Unable to cancel execution');
        }
      };

      const payload: ProgressToastPayload = {
        title: 'Running Synthetic Test',
        agentName: 'SyntheticPipeline',
        conceptUuid: data.conceptUuid,
        conceptTitle: data.conceptTitle,
        message: data.message || 'Processing synthetic interviews...',
        progress: data.progress,
        startTime,
        fallbackEstimatedSeconds: 300,
        onCancel: handleCancel,
        sectionKey: 'synthetic_execution',
      };

      if (!existing) {
        telemetry.debug('synthetic.execution.toast.create', {
          toastKey,
          progress: data.progress,
        });
        const toastId = toast.progress(payload);
        const record: ConceptWorkflowToastRecord = {
          toastId,
          data: payload,
          keys: new Set([toastKey]),
        };
        conceptWorkflowToasts.set(toastKey, record);
      } else {
        telemetry.debug('synthetic.execution.toast.update', {
          toastKey,
          progress: data.progress,
        });
        toast.updateProgress(existing.toastId, payload);
        existing.data = payload;
      }
    },
    [],
  );

  // Subscribe to Zustand syntheticTesting state changes for toast coordination
  React.useEffect(() => {
    let prevModalOpen = useStore.getState().syntheticTesting.isModalOpen;
    let prevExecutionState =
      useStore.getState().syntheticTesting.lastExecutionState;

    const unsubscribe = useStore.subscribe((state) => {
      const currentModalOpen = state.syntheticTesting.isModalOpen;
      const currentExecutionState = state.syntheticTesting.lastExecutionState;

      // Modal opened: dismiss existing toast
      if (!prevModalOpen && currentModalOpen) {
        const execState = currentExecutionState || prevExecutionState;
        if (execState?.conceptUuid && execState?.testUuid) {
          const toastKey = `${execState.conceptUuid}-${execState.testUuid}`;
          const existing = conceptWorkflowToasts.get(toastKey);
          if (existing) {
            try {
              toast.dismiss(existing.toastId);
            } catch {
              // Toast may have already been dismissed
            }
            conceptWorkflowToasts.delete(toastKey);
          }
        }
      }

      // Modal closed: recreate progress toast if execution is still running
      if (prevModalOpen && !currentModalOpen) {
        setTimeout(() => {
          if (useStore.getState().syntheticTesting.isModalOpen) return;

          const execState =
            useStore.getState().syntheticTesting.lastExecutionState;
          if (
            execState &&
            execState.progress !== undefined &&
            execState.progress < 100 &&
            execState.executionId
          ) {
            upsertSyntheticToast({
              conceptUuid: execState.conceptUuid!,
              testUuid: execState.testUuid!,
              executionId: execState.executionId,
              progress: execState.progress,
              message: execState.message || '',
              startTime: execState.startTime,
              conceptTitle: execState.conceptTitle,
            });
          }
        }, 100);
      }

      // Execution cancelled: lastExecutionState set to null
      if (prevExecutionState && !currentExecutionState) {
        if (prevExecutionState.conceptUuid && prevExecutionState.testUuid) {
          const toastKey = `${prevExecutionState.conceptUuid}-${prevExecutionState.testUuid}`;
          const existing = conceptWorkflowToasts.get(toastKey);
          if (existing) {
            try {
              toast.dismiss(existing.toastId);
            } catch {
              // Toast may have already been dismissed
            }
            conceptWorkflowToasts.delete(toastKey);
          }
        }
      }

      prevModalOpen = currentModalOpen;
      prevExecutionState = currentExecutionState;
    });

    return unsubscribe;
  }, [upsertSyntheticToast]);

  // Register synthetic execution progress event
  useSocketEvent<
    'synthetic.execution.progress.user',
    ISyntheticExecutionProgressMessage
  >('synthetic.execution.progress.user', (data) => {
    const toastKey = `${data.conceptUuid}-${data.testUuid}`;
    const syntheticState = useStore.getState().syntheticTesting;

    const currentState = syntheticState.lastExecutionState;
    const startTime =
      currentState?.startTime ?? (data.progress === 0 ? Date.now() : undefined);

    if (data.progress < 100) {
      syntheticState.setLastExecutionState({
        conceptUuid: data.conceptUuid,
        testUuid: data.testUuid,
        executionId: data.executionId,
        progress: data.progress,
        message: data.message,
        startTime,
        conceptTitle: data.conceptTitle,
      });
    } else {
      syntheticState.setLastExecutionState(null);
    }

    if (data.progress < 100) {
      upsertSyntheticToast({
        conceptUuid: data.conceptUuid,
        testUuid: data.testUuid,
        executionId: data.executionId,
        progress: data.progress,
        message: data.message,
        startTime,
        conceptTitle: data.conceptTitle,
      });
    }

    if (data.progress >= 100) {
      const existing = conceptWorkflowToasts.get(toastKey);
      if (existing) {
        toast.dismiss(existing.toastId);
        conceptWorkflowToasts.delete(toastKey);
      }

      const messageKey = `synthetic-complete-${data.conceptUuid}-${data.testUuid}`;
      if (preventDuplicate(messageKey)) return;

      toast.deferred.completed('Synthetic Testing Complete', data.conceptTitle);
    }
  });

  // Register synthetic execution error event
  useSocketEvent<
    'synthetic.execution.error.user',
    ISyntheticExecutionErrorMessage
  >('synthetic.execution.error.user', (data) => {
    const toastKey = `${data.conceptUuid}-${data.testUuid}`;
    const existing = conceptWorkflowToasts.get(toastKey);
    if (existing) {
      toast.dismiss(existing.toastId);
      conceptWorkflowToasts.delete(toastKey);
    }

    const syntheticState = useStore.getState().syntheticTesting;
    if (
      syntheticState.lastExecutionState?.conceptUuid === data.conceptUuid &&
      syntheticState.lastExecutionState?.testUuid === data.testUuid
    ) {
      syntheticState.setLastExecutionState(null);
    }

    const messageKey = `synthetic-error-${data.conceptUuid}-${data.testUuid}`;
    if (preventDuplicate(messageKey)) return;

    const isCancellation = data.errorMessage?.toLowerCase().includes('cancel');
    if (isCancellation) return;

    toast.deferred.error(
      'Synthetic Testing Failed',
      data.errorMessage || 'An error occurred during execution',
    );
  });
};

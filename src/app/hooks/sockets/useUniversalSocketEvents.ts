import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@components';
import { toast as reactToast } from 'react-toastify';
import { useSocketEvent } from './aucctus';
import { AppPath } from '@routes/routes';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../query/query-keys';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import api from '@libs/api';
import type { Id } from 'react-toastify';
import type { ProgressToastPayload } from '@components/Notification/toast';
import {
  createStageMessage,
  DEFAULT_CONCEPT_REPORT_ESTIMATE_SECONDS,
  stageKeyFromMessage,
  CONCEPT_REPORT_STAGE_ORDER,
  type ConceptReportStageKey,
} from '../../utils/conceptReportHelpers';
import {
  IConcept,
  ISyntheticExecutionProgressMessage,
  ISyntheticExecutionErrorMessage,
  INucleusUploadProgressMessage,
  INucleusUploadCompletedMessage,
  INucleusUploadErrorMessage,
  INucleusAnswerProgressMessage,
  INucleusAnswerCompletedMessage,
  INucleusAnswerErrorMessage,
  IMagicShareProgressMessage,
  IMagicShareCompletedMessage,
  IMagicShareErrorMessage,
  IConceptWorkflowMessage,
  ConceptReportStatusBySection,
  ConceptReportStatus,
  ITestGenerationCompletedMessage,
  ITestGenerationErrorMessage,
} from '@libs/api/types';
import { normalizeReportSectionKey } from '@libs/utils/concepts';

type ConceptWorkflowToastRecord = {
  toastId: Id;
  data: ProgressToastPayload;
  keys: Set<string>;
};

const conceptWorkflowToasts = new Map<string, ConceptWorkflowToastRecord>();

// SessionStorage helpers for persistence across refreshes
const STORAGE_KEY_PREFIX = 'concept-workflow-toast-';
const TOAST_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

type PersistedToastData = {
  data: ProgressToastPayload;
  timestamp: number;
};

const persistToastData = (key: string, data: ProgressToastPayload) => {
  try {
    const persistedData: PersistedToastData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      STORAGE_KEY_PREFIX + key,
      JSON.stringify(persistedData),
    );
  } catch (e) {
    // Silently fail if storage is unavailable
  }
};

const getPersistedToastData = (key: string): ProgressToastPayload | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!stored) return null;

    const persistedData: PersistedToastData = JSON.parse(stored);

    // Check if data has expired (older than 1 hour)
    const age = Date.now() - persistedData.timestamp;
    if (age > TOAST_TTL_MS) {
      // Clean up expired data
      clearPersistedToastData(key);
      return null;
    }

    return persistedData.data;
  } catch (e) {
    return null;
  }
};

const clearPersistedToastData = (key: string) => {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  } catch (e) {
    // Silently fail
  }
};

const registerToastRecordKeys = (
  record: ConceptWorkflowToastRecord,
  keys: string[],
) => {
  keys.forEach((key) => {
    if (!key) return;
    record.keys.add(key);
    conceptWorkflowToasts.set(key, record);
    persistToastData(key, record.data);
  });
};

const getToastRecordForKeys = (
  keys: string[],
  registerKeys = false,
): ConceptWorkflowToastRecord | undefined => {
  for (const key of keys) {
    if (!key) continue;
    const record = conceptWorkflowToasts.get(key);
    if (record) {
      if (registerKeys) {
        registerToastRecordKeys(record, keys);
      }
      return record;
    }
  }
  return undefined;
};

const clearToastRecord = (record: ConceptWorkflowToastRecord) => {
  record.keys.forEach((key) => {
    conceptWorkflowToasts.delete(key);
    clearPersistedToastData(key);
  });
  record.keys.clear();
};

const getToastKeysFromMessage = (
  message: IConceptWorkflowMessage,
): string[] => {
  const keys: string[] = [];
  if (message.conceptRootIdentifier) {
    keys.push(message.conceptRootIdentifier);
  }
  if (message.conceptUuid) {
    keys.push(message.conceptUuid);
  }
  return keys;
};

export const dismissConceptWorkflowToastForConcept = (
  conceptUuid?: string,
  conceptIdentifier?: string,
) => {
  const keys = [conceptIdentifier, conceptUuid].filter(
    (value): value is string => Boolean(value),
  );

  if (!keys.length) {
    return;
  }

  const record = getToastRecordForKeys(keys);
  if (!record) return;

  toast.dismiss(record.toastId);
  clearToastRecord(record);
};

/**
 * Restore/show the progress toast for a concept workflow
 * Creates a new toast with the current progress data if a record exists and the toast is not already visible
 * This is useful when the user has dismissed the toast but wants to see progress again
 * Also checks localStorage for persisted data after page refresh
 */
export const restoreConceptWorkflowToast = (
  conceptUuid?: string,
  conceptIdentifier?: string,
) => {
  const keys = [conceptIdentifier, conceptUuid].filter(
    (value): value is string => Boolean(value),
  );

  if (!keys.length) {
    return;
  }

  let existing = getToastRecordForKeys(keys);

  // If no in-memory record, try to restore from sessionStorage
  if (!existing) {
    for (const key of keys) {
      if (!key) continue;
      const persistedData = getPersistedToastData(key);
      if (persistedData) {
        // Create a new toast from persisted data
        const toastId = toast.progress(persistedData);
        existing = {
          toastId,
          data: persistedData,
          keys: new Set<string>(),
        };
        registerToastRecordKeys(existing, keys);
        return;
      }
    }
    // No persisted data either
    return;
  }

  // Check if the toast is still active/visible
  // If it is, do nothing (don't create a duplicate)
  if (reactToast.isActive(existing.toastId)) {
    return;
  }

  // Toast was dismissed, create a new one with the existing data
  const newToastId = toast.progress(existing.data);
  existing.toastId = newToastId;
};

// Define event handler types
export interface ConceptWorkflowHandler {
  onWorkflowCompleted?: (message: any) => void;
  onWorkflowError?: (message: any) => void;
}

export interface SyntheticTestingHandler {
  onExecutionCompleted?: (message: ISyntheticExecutionProgressMessage) => void;
  onExecutionError?: (message: ISyntheticExecutionErrorMessage) => void;
}

// Nucleus upload event handler types
export interface NucleusUploadHandler {
  onUploadProgress?: (message: INucleusUploadProgressMessage) => void;
  onUploadCompleted?: (message: INucleusUploadCompletedMessage) => void;
  onUploadError?: (message: INucleusUploadErrorMessage) => void;
}

// Nucleus answer generation event handler types
export interface NucleusAnswerHandler {
  onAnswerProgress?: (message: INucleusAnswerProgressMessage) => void;
  onAnswerCompleted?: (message: INucleusAnswerCompletedMessage) => void;
  onAnswerError?: (message: INucleusAnswerErrorMessage) => void;
}

// Magic Share event handler types
export interface MagicShareHandler {
  onShareProgress?: (message: IMagicShareProgressMessage) => void;
  onShareCompleted?: (message: IMagicShareCompletedMessage) => void;
  onShareError?: (message: IMagicShareErrorMessage) => void;
}

export interface TestGenerationHandler {
  onGenerationCompleted?: (message: ITestGenerationCompletedMessage) => void;
  onGenerationError?: (message: ITestGenerationErrorMessage) => void;
}

// Idea Playground event handler types
export interface IdeaPlaygroundHandler {
  onConceptsGenerated?: (message: any) => void;
}

// Universal socket event configuration
export interface SocketEventConfig {
  // Concept workflow events
  conceptWorkflow?: ConceptWorkflowHandler;

  // Synthetic testing events
  syntheticTesting?: SyntheticTestingHandler;

  // Nucleus upload events
  nucleusUpload?: NucleusUploadHandler;

  // Nucleus answer generation events
  nucleusAnswer?: NucleusAnswerHandler;

  // Magic Share events
  magicShare?: MagicShareHandler;

  // Test generation events
  testGeneration?: TestGenerationHandler;
  // Idea Playground events
  ideaPlayground?: IdeaPlaygroundHandler;

  // Add more event types here as needed
  // customerProfile?: CustomerProfileHandler;
  // aiEditing?: AiEditingHandler;
}

const normalizeStatusMap = (
  statusMap?: ConceptReportStatusBySection,
): ConceptReportStatusBySection | undefined => {
  if (!statusMap) return undefined;
  const normalized: Record<string, ConceptReportStatusBySection[string]> = {};

  Object.entries(statusMap).forEach(([sectionKey, sectionStatus]) => {
    const normalizedKey = normalizeReportSectionKey(sectionKey);
    if (!normalizedKey) return;
    normalized[normalizedKey] = sectionStatus;
  });

  return normalized as ConceptReportStatusBySection;
};

const mergeReportStatusBySection = (
  existing?: ConceptReportStatusBySection,
  incoming?: ConceptReportStatusBySection,
): ConceptReportStatusBySection | undefined => {
  if (!incoming) return existing;
  return {
    ...(existing || {}),
    ...incoming,
  };
};

/**
 * Universal hook for managing WebSocket events across the application
 * Provides a centralized way to handle different types of socket events
 *
 * @param config - Configuration object for different event handlers
 */
export const useUniversalSocketEvents = (config: SocketEventConfig) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setShareProgress = useStore(
    (state) => state.magicShare.setShareProgress,
  );
  const addPendingSections = useStore(
    (state) => state.conceptReport.addPendingSections,
  );
  const clearPendingSections = useStore(
    (state) => state.conceptReport.clearPendingSections,
  );
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid,
  );

  // Prevent duplicate toasts by tracking recent messages
  const recentMessages = React.useRef(new Set<string>());

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

      // Reset startTime when a new execution begins (progress === 0)
      // Otherwise, reuse existing startTime or use provided startTime
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

      // Cancel handler for the toast
      const handleCancel = async () => {
        try {
          await api.testing.cancelSyntheticExecution(
            data.conceptUuid,
            data.testUuid,
            data.executionId,
          );
          // Dismiss toast
          const toastRecord = conceptWorkflowToasts.get(toastKey);
          if (toastRecord) {
            toast.dismiss(toastRecord.toastId);
            conceptWorkflowToasts.delete(toastKey);
          }
          // Clear store state
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

  // Listen for modal close events to trigger toast creation
  React.useEffect(() => {
    const handleModalClosed = (event: CustomEvent) => {
      const data = event.detail;
      if (data && data.progress < 100 && data.executionId) {
        upsertSyntheticToast({
          conceptUuid: data.conceptUuid,
          testUuid: data.testUuid,
          executionId: data.executionId,
          progress: data.progress,
          message: data.message,
          startTime: data.startTime,
          conceptTitle: data.conceptTitle,
        });
      }
    };

    const handleModalOpened = (event: CustomEvent) => {
      const data = event.detail;

      // Dismiss any existing toast for this execution
      if (data?.conceptUuid && data?.testUuid) {
        const toastKey = `${data.conceptUuid}-${data.testUuid}`;
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
    };

    const handleExecutionCancelled = (event: CustomEvent) => {
      const data = event.detail;

      // Immediately dismiss toast when cancel button is clicked
      if (data?.conceptUuid && data?.testUuid) {
        const toastKey = `${data.conceptUuid}-${data.testUuid}`;
        const existing = conceptWorkflowToasts.get(toastKey);
        if (existing) {
          try {
            toast.dismiss(existing.toastId);
          } catch {
            // Toast may have already been dismissed
          }
          conceptWorkflowToasts.delete(toastKey);
        }

        // Clear the execution state so toast doesn't reappear when modal closes
        const syntheticState = useStore.getState().syntheticTesting;
        if (
          syntheticState.lastExecutionState?.conceptUuid === data.conceptUuid &&
          syntheticState.lastExecutionState?.testUuid === data.testUuid
        ) {
          syntheticState.setLastExecutionState(null);
        }
      }
    };

    window.addEventListener(
      'synthetic-modal-closed',
      handleModalClosed as EventListener,
    );
    window.addEventListener(
      'synthetic-modal-opened',
      handleModalOpened as EventListener,
    );
    window.addEventListener(
      'synthetic-execution-cancelled',
      handleExecutionCancelled as EventListener,
    );

    return () => {
      window.removeEventListener(
        'synthetic-modal-closed',
        handleModalClosed as EventListener,
      );
      window.removeEventListener(
        'synthetic-modal-opened',
        handleModalOpened as EventListener,
      );
      window.removeEventListener(
        'synthetic-execution-cancelled',
        handleExecutionCancelled as EventListener,
      );
    };
  }, [upsertSyntheticToast]);

  // Helper function to check and prevent duplicate messages
  const preventDuplicate = (messageKey: string): boolean => {
    if (recentMessages.current.has(messageKey)) {
      return true; // Is duplicate, should prevent
    }

    // Add to recent messages and auto-remove after 2 seconds
    recentMessages.current.add(messageKey);
    setTimeout(() => recentMessages.current.delete(messageKey), 2000);
    return false; // Not duplicate, can proceed
  };

  const resolveStageKey = (
    message: IConceptWorkflowMessage,
  ): ConceptReportStageKey | undefined => {
    if (
      message.eventType === 'section_started' &&
      message.message?.toLowerCase().includes('workflow started')
    ) {
      return 'ecosystem';
    }

    if (message.eventType === 'workflow_completed') {
      return 'overview';
    }

    const derived = stageKeyFromMessage(message.message);
    if (derived) return derived;

    if (message.eventType === 'workflow_error') {
      const activeStage = CONCEPT_REPORT_STAGE_ORDER.find(
        (stage: (typeof CONCEPT_REPORT_STAGE_ORDER)[number]) =>
          message.reportStatusBySection?.[stage.key]?.status === 'error',
      );
      return activeStage?.key;
    }

    return undefined;
  };

  const upsertConceptWorkflowToast = (message: IConceptWorkflowMessage) => {
    const toastKeys = getToastKeysFromMessage(message);
    if (toastKeys.length === 0) return;

    const stageKey = resolveStageKey(message);
    const stageMessage =
      createStageMessage(stageKey, message.eventType) ||
      message.message ||
      undefined;

    const existing = getToastRecordForKeys(toastKeys, true);
    const startTime = existing?.data.startTime ?? Date.now();

    // Use concept data from message directly (backend now sends conceptTitle)
    const conceptUuid = message.conceptUuid || existing?.data.conceptUuid;
    const conceptTitle = message.conceptTitle || existing?.data.conceptTitle;
    const conceptIdentifier =
      message.conceptRootIdentifier || existing?.data.conceptIdentifier;

    telemetry.debug('concept_workflow.toast.upsert', {
      toastKeys,
      stageKey,
      stageMessage,
      hasExisting: Boolean(existing),
      conceptTitle,
      conceptIdentifier,
    });

    const payload: ProgressToastPayload = {
      title: message.message || 'Generating Concept Report',
      conceptTitle: conceptTitle,
      agentName: 'ConceptReportPipeline',
      conceptUuid: conceptUuid,
      conceptIdentifier: conceptIdentifier,
      message: stageMessage,
      startTime,
      overrideEstimatedSeconds: existing?.data.overrideEstimatedSeconds,
      fallbackEstimatedSeconds:
        existing?.data.fallbackEstimatedSeconds ??
        DEFAULT_CONCEPT_REPORT_ESTIMATE_SECONDS,
    };

    if (!existing) {
      const toastId = toast.progress(payload);
      const record: ConceptWorkflowToastRecord = {
        toastId,
        data: payload,
        keys: new Set<string>(),
      };
      registerToastRecordKeys(record, toastKeys);
    } else {
      const mergedData = {
        ...existing.data,
        ...payload,
        startTime,
      } as ProgressToastPayload;

      if (existing.data.progress === undefined) {
        delete (mergedData as any).progress;
      }

      toast.updateProgress(existing.toastId, mergedData);
      existing.data = mergedData;
      registerToastRecordKeys(existing, toastKeys);
    }
  };

  const finalizeConceptWorkflowToast = (
    message: IConceptWorkflowMessage,
    dismissDelayMs = 2000,
  ) => {
    const toastKeys = getToastKeysFromMessage(message);
    if (toastKeys.length === 0) return;

    const existing = getToastRecordForKeys(toastKeys, true);
    if (!existing) return;

    const stageKey = resolveStageKey(message);

    // On workflow error, immediately dismiss progress toast to avoid showing as progress
    if (message.eventType === 'workflow_error') {
      toast.dismiss(existing.toastId);
      clearToastRecord(existing);
      return;
    }

    const payload: ProgressToastPayload = {
      ...existing.data,
      progress: 100,
      message:
        createStageMessage(stageKey, message.eventType) ||
        message.message ||
        existing.data.message,
    };

    toast.updateProgress(existing.toastId, payload);
    existing.data = payload;

    telemetry.debug('concept_workflow.toast.finalize', {
      toastKeys,
      stageKey,
      dismissDelayMs,
      eventType: message.eventType,
    });

    setTimeout(() => {
      toast.dismiss(existing.toastId);
      clearToastRecord(existing);
    }, dismissDelayMs);
  };

  const syncPendingOverridesFromServer = (
    identifier: string | undefined,
    reportStatusBySection?: ConceptReportStatusBySection,
  ) => {
    if (!identifier || !reportStatusBySection) {
      return;
    }

    const existingOverrides =
      useStore.getState().conceptReport.pendingSectionOverrides?.[identifier] ||
      {};

    const sectionsToAdd: Record<string, string> = {};
    const sectionsToClear: string[] = [];

    Object.entries(reportStatusBySection).forEach(([sectionKey, status]) => {
      if (!status) return;

      const sectionStatus = typeof status === 'string' ? status : status.status;

      if (sectionStatus === 'pending') {
        const dateStarted =
          typeof status === 'string' ? undefined : status.dateStarted;
        // Only add override if the section has actually started (has a dateStarted value)
        // Sections that are pending but haven't started yet should not have overrides
        if (dateStarted) {
          sectionsToAdd[sectionKey] = dateStarted;
        } else {
          // If section is pending but hasn't started, clear any stale overrides
          const override = existingOverrides[sectionKey];
          if (override) {
            sectionsToClear.push(sectionKey);
          }
        }
        return;
      }

      const override = existingOverrides[sectionKey];
      if (!override) {
        return;
      }

      const dateCompleted =
        typeof status === 'string' ? undefined : status.dateCompleted;
      const dateStarted =
        typeof status === 'string' ? undefined : status.dateStarted;

      if (
        dateCompleted &&
        override.appliedAt &&
        dateCompleted >= override.appliedAt
      ) {
        sectionsToClear.push(sectionKey);
        return;
      }

      if (
        !dateCompleted &&
        dateStarted &&
        override.appliedAt &&
        dateStarted > override.appliedAt
      ) {
        sectionsToClear.push(sectionKey);
      }
    });

    if (Object.keys(sectionsToAdd).length > 0) {
      addPendingSections(identifier, sectionsToAdd);
    }

    if (sectionsToClear.length > 0) {
      clearPendingSections(identifier, sectionsToClear);
    }
  };

  // Note: Concept workflow events are handled directly by useSocketEvent calls below

  // Register concept workflow socket event
  useSocketEvent<'concept.workflow.update.account', IConceptWorkflowMessage>(
    'concept.workflow.update.account',
    (message) => {
      if (!config.conceptWorkflow) return;

      if (
        message.eventType === 'section_started' ||
        message.eventType === 'section_completed' ||
        message.eventType === 'workflow_completed' ||
        message.eventType === 'workflow_error'
      ) {
        upsertConceptWorkflowToast(message);
      }

      if (message.eventType === 'workflow_completed') {
        finalizeConceptWorkflowToast(message);

        // Check for duplicates
        const messageKey = `${message.eventType}-${message.conceptRootIdentifier || 'unknown'}`;
        if (preventDuplicate(messageKey)) return;

        // Determine if this is a partial regeneration (AI edit) vs full workflow
        // Full workflow: completedSections === totalSections (all sections regenerated)
        // Partial regeneration: completedSections < totalSections (only some sections updated)
        const completedSections =
          typeof message.completedSections === 'number'
            ? message.completedSections
            : Array.isArray(message.completedSections)
              ? message.completedSections.length
              : 0;
        const totalSections = message.totalSections ?? 0;
        const isPartialRegeneration =
          totalSections > 0 && completedSections < totalSections;

        if (isPartialRegeneration) {
          // Skip showing the "Concept Report Ready" toast for partial regenerations
          // The section_completed handler already shows "Section updated successfully!"
          return;
        }

        // CRITICAL: Invalidate concept queries to force refetch of featureVersions
        // This ensures we get the latest concept data including updated featureVersions
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.concept, message.conceptUuid],
        });
        if (
          message.conceptRootIdentifier &&
          message.conceptRootIdentifier !== message.conceptUuid
        ) {
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concept, message.conceptRootIdentifier],
          });
        }

        // Invalidate testDetails queries when assumptions section completes
        // This ensures the Testing tab shows the latest regenerated test data
        if (message.reportStatusBySection?.assumptions?.status === 'complete') {
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.testDetails, message.conceptUuid],
          });
        }

        // Show completion toast for individual sections
        // Only show toast if this is for the currently active concept
        const activeConceptUuid = useStore.getState().conceptReport.conceptUuid;
        const matchesActive =
          message.conceptUuid === activeConceptUuid ||
          message.conceptRootIdentifier === activeConceptUuid;

        if (matchesActive || !activeConceptUuid) {
          // Show toast if it matches active concept or if no concept is active (user is not on concept page)
          // Use toast.deferred to avoid "setState during render" warning
          // when this event arrives while a component (like ConceptReport) is rendering
          const handler =
            config.conceptWorkflow.onWorkflowCompleted ||
            ((msg: any) => {
              toast.deferred.completed(
                'Concept Report Ready',
                msg.conceptTitle,
                undefined,
                () => {
                  const conceptUrl = AppPath.ConceptOverview.replace(
                    ':id',
                    msg.conceptRootIdentifier,
                  );
                  navigate(conceptUrl);
                },
              );
            });
          handler(message);
        }
      } else if (message.eventType === 'section_completed') {
        // Handle individual section completion - update cache with new data

        if (message.reportStatusBySection && message.conceptUuid) {
          const normalizedStatus = normalizeStatusMap(
            message.reportStatusBySection,
          );
          const aggregateStatus = message.aggregateStatus as
            | ConceptReportStatus
            | undefined;

          // Update the concept cache with the new section status data
          queryClient.setQueryData<IConcept | undefined>(
            [AucctusQueryKeys.concept, message.conceptUuid],
            (existing) => {
              if (!existing) return existing;
              const mergedSections = mergeReportStatusBySection(
                existing.reportStatusBySection,
                normalizedStatus,
              );

              return {
                ...existing,
                ...(mergedSections && {
                  reportStatusBySection: mergedSections,
                }),
                ...(aggregateStatus && {
                  reportStatusAggregate: aggregateStatus,
                }),
              };
            },
          );

          // Also update by identifier if different
          if (
            message.conceptRootIdentifier &&
            message.conceptRootIdentifier !== message.conceptUuid
          ) {
            queryClient.setQueryData<IConcept | undefined>(
              [AucctusQueryKeys.concept, message.conceptRootIdentifier],
              (existing) => {
                if (!existing) return existing;
                const mergedSections = mergeReportStatusBySection(
                  existing.reportStatusBySection,
                  normalizedStatus,
                );
                return {
                  ...existing,
                  ...(mergedSections && {
                    reportStatusBySection: mergedSections,
                  }),
                  ...(aggregateStatus && {
                    reportStatusAggregate: aggregateStatus,
                  }),
                };
              },
            );
          }

          // CRITICAL: Invalidate concept queries to force refetch of featureVersions
          // This ensures we get the latest concept data including updated featureVersions
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concept, message.conceptUuid],
          });
          if (message.conceptRootIdentifier) {
            queryClient.invalidateQueries({
              queryKey: [
                AucctusQueryKeys.concept,
                message.conceptRootIdentifier,
              ],
            });
          }

          const overrideIdentifier =
            message.conceptRootIdentifier || message.conceptUuid;
          syncPendingOverridesFromServer(overrideIdentifier, normalizedStatus);

          // Show completion toast for individual sections
          // Only show toast if the concept UUID (NOT identifier) matches the active concept UUID
          const toastKeys = getToastKeysFromMessage(message);
          const hasActiveProgressToast =
            getToastRecordForKeys(toastKeys, true) !== undefined;
          const matchesActiveConcept =
            activeConceptUuid && message.conceptUuid === activeConceptUuid;

          if (matchesActiveConcept && !hasActiveProgressToast) {
            // Use toast.deferred to avoid "setState during render" warning
            toast.deferred.success(
              `Section updated successfully!`,
              message.message || 'Your changes have been applied.',
              5000,
            );
          }
        }
      } else if (message.eventType === 'workflow_error') {
        finalizeConceptWorkflowToast(message, 4000);

        // Check for duplicates
        const messageKey = `${message.eventType}-${message.message || 'unknown'}`;
        if (preventDuplicate(messageKey)) return;

        // Only show toast if this is for the currently active concept
        const activeConceptUuid = useStore.getState().conceptReport.conceptUuid;
        const matchesActive =
          message.conceptUuid === activeConceptUuid ||
          message.conceptRootIdentifier === activeConceptUuid;

        if (matchesActive || !activeConceptUuid) {
          // Show toast if it matches active concept or if no concept is active (user is not on concept page)
          // Use toast.deferred to avoid "setState during render" warning
          const handler =
            config.conceptWorkflow.onWorkflowError ||
            ((msg: any) => {
              toast.deferred.error(
                'Concept Generation Failed',
                msg.message ||
                  'An error occurred while generating your concept report',
              );
            });
          handler(message);
        }
      }
    },
  );

  // Register synthetic execution progress event (GLOBAL) with toast management
  useSocketEvent<
    'synthetic.execution.progress.user',
    ISyntheticExecutionProgressMessage
  >('synthetic.execution.progress.user', (data) => {
    if (!config.syntheticTesting) return;

    const toastKey = `${data.conceptUuid}-${data.testUuid}`;
    const syntheticState = useStore.getState().syntheticTesting;
    // const isModalOpen = syntheticState.isModalOpen;

    // Store the latest execution state for toast creation when modal closes
    // Capture startTime on first progress update (progress: 0) to match modal's timing
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
      // Execution finished — clear persisted state so stale toasts don't reappear
      syntheticState.setLastExecutionState(null);
    }

    // Show/update progress toast regardless of modal state
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

    // Handle completion
    if (data.progress >= 100) {
      const existing = conceptWorkflowToasts.get(toastKey);
      if (existing) {
        toast.dismiss(existing.toastId);
        conceptWorkflowToasts.delete(toastKey);
      }

      const messageKey = `synthetic-complete-${data.conceptUuid}-${data.testUuid}`;
      if (preventDuplicate(messageKey)) return;

      const handler =
        config.syntheticTesting.onExecutionCompleted ||
        (() => {
          // Use toast.deferred to avoid "setState during render" warning
          toast.deferred.completed(
            'Synthetic Testing Complete',
            data.conceptTitle,
          );
        });

      handler(data);
    }
  });

  // Register synthetic execution error event (GLOBAL)
  useSocketEvent<
    'synthetic.execution.error.user',
    ISyntheticExecutionErrorMessage
  >('synthetic.execution.error.user', (data) => {
    if (!config.syntheticTesting) return;

    // Dismiss any active progress toast
    const toastKey = `${data.conceptUuid}-${data.testUuid}`;
    const existing = conceptWorkflowToasts.get(toastKey);
    if (existing) {
      toast.dismiss(existing.toastId);
      conceptWorkflowToasts.delete(toastKey);
    }

    // Clear persisted execution progress so stale toasts don't appear later
    const syntheticState = useStore.getState().syntheticTesting;
    if (
      syntheticState.lastExecutionState?.conceptUuid === data.conceptUuid &&
      syntheticState.lastExecutionState?.testUuid === data.testUuid
    ) {
      syntheticState.setLastExecutionState(null);
    }

    const messageKey = `synthetic-error-${data.conceptUuid}-${data.testUuid}`;
    if (preventDuplicate(messageKey)) return;

    const handler =
      config.syntheticTesting.onExecutionError ||
      ((msg: ISyntheticExecutionErrorMessage) => {
        // Don't show toast for cancellation errors (user-initiated)
        const isCancellation = msg.errorMessage
          ?.toLowerCase()
          .includes('cancel');
        if (isCancellation) return;

        // Use toast.deferred to avoid "setState during render" warning
        toast.deferred.error(
          'Synthetic Testing Failed',
          msg.errorMessage || 'An error occurred during execution',
        );
      });

    handler(data);
  });

  // Register test generation completion events (GLOBAL)
  useSocketEvent<
    'test.generation.completed.user',
    ITestGenerationCompletedMessage
  >('test.generation.completed.user', (data) => {
    const messageKey = `test-generation-complete-${data.conceptUuid}-${data.testUuid}`;
    if (preventDuplicate(messageKey)) return;

    const handler = config.testGeneration?.onGenerationCompleted;
    // ((msg: ITestGenerationCompletedMessage) => {
    //   toast.completed(
    //     'Test Generated',
    //     msg.message || 'Your new test is ready to run',
    //   );
    // });

    handler?.(data);
  });

  // Register test generation error events (GLOBAL)
  useSocketEvent<'test.generation.error.user', ITestGenerationErrorMessage>(
    'test.generation.error.user',
    (data) => {
      const messageKey = `test-generation-error-${data.conceptUuid}-${data.testUuid || 'unknown'}`;
      if (preventDuplicate(messageKey)) return;

      const handler = config.testGeneration?.onGenerationError;
      // ((msg: ITestGenerationErrorMessage) => {
      //   toast.error(
      //     'Test Generation Failed',
      //     msg.message ||
      //       'We could not generate a new test right now. Please try again.',
      //   );
      // });

      handler?.(data);
    },
  );

  // Register nucleus upload progress events
  useSocketEvent<
    'nucleus_upload.progress.account',
    INucleusUploadProgressMessage
  >('nucleus_upload.progress.account', (message) => {
    if (!config.nucleusUpload) return;

    const handler =
      config.nucleusUpload.onUploadProgress ||
      ((msg: INucleusUploadProgressMessage) => {
        if (msg.stage === 'completed') {
          // Use toast.deferred to avoid "setState during render" warning
          toast.deferred.completed('Documents Processed');
        } else if (msg.stage === 'processing' && msg.progress) {
          // TODO: Track with toast ID and use toast.updateProgress() for real progress tracking
          // For now, just show info about processing
          return; // Skip progress notifications - will be handled by final completion toast
        } else if (msg.stage === 'validating') {
          // Skip validation notifications - completion toast is sufficient
          return;
        }
      });
    handler(message);
  });

  // Register nucleus upload completed events
  useSocketEvent<
    'nucleus_upload.completed.account',
    INucleusUploadCompletedMessage
  >('nucleus_upload.completed.account', (message) => {
    if (!config.nucleusUpload) return;

    // Check for duplicates
    const messageKey = `nucleus-completed-${message.nucleusReportUuid}-${message.uploadedCount}`;
    if (preventDuplicate(messageKey)) return;

    const handler =
      config.nucleusUpload.onUploadCompleted ||
      ((msg: INucleusUploadCompletedMessage) => {
        // Invalidate nucleus queries to refresh data
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.nucleusReportLatest],
        });

        // Use toast.deferred to avoid "setState during render" warning
        toast.deferred.completed(
          `${msg.uploadedCount} Document${msg.uploadedCount > 1 ? 's' : ''} Uploaded`,
        );
      });
    handler(message);
  });

  // Register nucleus upload error events
  useSocketEvent<'nucleus_upload.error.account', INucleusUploadErrorMessage>(
    'nucleus_upload.error.account',
    (message) => {
      if (!config.nucleusUpload) return;

      // Check for duplicates
      const messageKey = `nucleus-error-${message.nucleusReportUuid || 'unknown'}-${message.errorCode || message.message}`;
      if (preventDuplicate(messageKey)) return;

      const handler =
        config.nucleusUpload.onUploadError ||
        ((msg: INucleusUploadErrorMessage) => {
          // Use toast.deferred to avoid "setState during render" warning
          toast.deferred.error(
            'Document Upload Failed',
            msg.message || 'Please try uploading your documents again',
          );
        });
      handler(message);
    },
  );

  // Register nucleus answer generation completed events
  useSocketEvent<
    'nucleus_answer.completed.account',
    INucleusAnswerCompletedMessage
  >('nucleus_answer.completed.account', (message) => {
    // Check for duplicates
    const messageKey = `nucleus-answer-completed-${message.questionUuid}-${message.answerUuid}`;
    if (preventDuplicate(messageKey)) return;

    // Note: No query invalidation needed here. The comprehensive nucleus_report.progress.account
    // websocket events provide all progress updates via payload data, eliminating the need for
    // additional API refetches. Components using useNucleusLoadingState will receive updates
    // directly from the websocket payload.

    // Show toast in the future if needed for individual answer completions
    if (config.nucleusAnswer?.onAnswerCompleted) {
      config.nucleusAnswer.onAnswerCompleted(message);
    }
  });

  // Register nucleus answer generation error events
  useSocketEvent<'nucleus_answer.error.account', INucleusAnswerErrorMessage>(
    'nucleus_answer.error.account',
    () => {
      return;
    },
  );

  // Register Magic Share progress events
  useSocketEvent<'magic_share.progress.account', IMagicShareProgressMessage>(
    'magic_share.progress.account',
    (message) => {
      // Construct magicShareUuid from accountUuid:conceptUuid
      const magicShareUuid = `${message.accountUuid}:${message.conceptUuid}`;

      // Store progress in Zustand store
      setShareProgress(
        message.conceptUuid,
        message.stage,
        message.message,
        message.progress,
        undefined,
        magicShareUuid,
      );

      const handler =
        config?.magicShare?.onShareProgress ||
        ((msg: IMagicShareProgressMessage) => {
          const stageMessages: Record<string, string> = {
            started: 'Starting Magic Share generation...',
            gathering_data: 'Gathering concept data...',
            generating_html: 'Generating HTML...',
            generating_pdf: 'Generating PDF...',
            generating_video: 'Generating video...',
            uploading: 'Uploading document...',
            completed: 'Magic Share completed!',
          };

          const displayMessage =
            stageMessages[msg.stage] || msg.message || 'Processing...';

          setShareProgress(
            msg.conceptUuid,
            msg.stage,
            displayMessage,
            msg.progress,
            undefined,
            magicShareUuid,
          );
        });
      handler(message);
    },
  );

  // Register idea playground concepts generated events
  useSocketEvent<'idea_playground.concepts.generated.user'>(
    'idea_playground.concepts.generated.user',
    (message) => {
      const handler =
        config?.ideaPlayground?.onConceptsGenerated ||
        ((msg: any) => {
          queryClient.invalidateQueries({
            queryKey: [
              AucctusQueryKeys.ideaPlaygroundGeneratedIdeas,
              msg.seedUuid,
            ],
          });
        });

      handler(message);
    },
  );

  // Register Magic Share completed events
  useSocketEvent<'magic_share.completed.account', IMagicShareCompletedMessage>(
    'magic_share.completed.account',
    (message) => {
      // Check for duplicates
      const messageKey = `magic-share-completed-${message.conceptUuid}`;
      if (preventDuplicate(messageKey)) return;

      const handler =
        config?.magicShare?.onShareCompleted ||
        ((msg: IMagicShareCompletedMessage) => {
          queryClient.invalidateQueries({
            queryKey: [
              AucctusQueryKeys.conceptMagicShareLatest,
              msg.conceptUuid,
            ],
          });

          setShareProgress(
            msg.conceptUuid,
            'completed',
            'Magic Share completed!',
            100,
            msg.snapshotUrl,
            msg.magicShareUuid,
          );
        });
      handler(message);
    },
  );

  // Register Magic Share error events
  useSocketEvent<'magic_share.error.account', IMagicShareErrorMessage>(
    'magic_share.error.account',
    (message) => {
      // Check for duplicates
      const messageKey = `magic-share-error-${message.conceptUuid}-${message.errorCode || message.message}`;
      if (preventDuplicate(messageKey)) return;

      const handler =
        config?.magicShare?.onShareError ||
        ((msg: IMagicShareErrorMessage) => {
          // Use toast.deferred to avoid "setState during render" warning
          toast.deferred.error(
            'Magic Share Failed',
            msg.message || 'Failed magic share generation. Please try again.',
            5000,
          );

          // Invalidate queries to trigger refetch of latest magic share data
          queryClient.invalidateQueries({
            queryKey: [
              AucctusQueryKeys.conceptMagicShareLatest,
              message.conceptUuid,
            ],
          });
        });
      handler(message);
    },
  );
};

/**
 * Predefined configurations for common use cases
 */
export const socketEventConfigs = {
  // Universal default handling for all application socket events
  universalDefault: (): SocketEventConfig => ({
    conceptWorkflow: {
      // Uses default handlers defined in the hook
    },
    syntheticTesting: {
      // Uses default handlers defined in the hook
    },
    nucleusUpload: {
      // Uses default handlers defined in the hook
    },
    nucleusAnswer: {
      // Uses default handlers defined in the hook
    },
    magicShare: {
      // Uses default handlers defined in the hook
    },
    ideaPlayground: {
      // Uses default handlers defined in the hook
    },
  }),
};

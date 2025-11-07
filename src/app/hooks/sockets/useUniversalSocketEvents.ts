import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@components';
import { useSocketEvent } from './aucctus';
import { AppPath } from '@routes/routes';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../query/query-keys';
import useStore from '@stores/store';
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
} from '@libs/api/types';

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

  // Idea Playground events
  ideaPlayground?: IdeaPlaygroundHandler;

  // Add more event types here as needed
  // customerProfile?: CustomerProfileHandler;
  // aiEditing?: AiEditingHandler;
}

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

  // Prevent duplicate toasts by tracking recent messages
  const recentMessages = React.useRef(new Set<string>());

  // Track recent section completions to suppress full workflow toast for AI edits/partial regenerations
  // Map: conceptIdentifier -> timestamp of last section completion
  const recentSectionCompletions = React.useRef(new Map<string, number>());

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

  // Note: Concept workflow events are handled directly by useSocketEvent calls below

  // Register concept workflow socket event
  useSocketEvent('concept.workflow.update.account', (message) => {
    if (!config.conceptWorkflow) return;

    if (message.eventType === 'workflow_completed') {
      // Check for duplicates
      const messageKey = `${message.eventType}-${message.conceptRootIdentifier || 'unknown'}`;
      if (preventDuplicate(messageKey)) return;

      // Check if a section just completed within the last 5 seconds
      // If so, this is a partial regeneration (AI edit), not a full concept generation
      if (message.conceptRootIdentifier) {
        const lastSectionCompletion = recentSectionCompletions.current.get(
          message.conceptRootIdentifier,
        );
        const isPartialRegeneration =
          lastSectionCompletion && Date.now() - lastSectionCompletion < 5000; // Within 5 seconds

        if (isPartialRegeneration) {
          // Clean up the tracking entry
          recentSectionCompletions.current.delete(
            message.conceptRootIdentifier,
          );
          return;
        }
      }

      // Only show toast if this is for the currently active concept
      const activeConceptUuid = useStore.getState().conceptReport.conceptUuid;
      const matchesActive =
        message.conceptUuid === activeConceptUuid ||
        message.conceptRootIdentifier === activeConceptUuid;

      if (matchesActive || !activeConceptUuid) {
        // Show toast if it matches active concept or if no concept is active (user is not on concept page)
        const handler =
          config.conceptWorkflow.onWorkflowCompleted ||
          ((msg: any) => {
            toast.completed(
              'Concept Report Ready',
              `Your concept report has been generated successfully`,
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

      // Track this section completion to suppress workflow_completed toast
      // This indicates a partial regeneration (AI edit), not a full concept generation
      if (message.conceptRootIdentifier) {
        recentSectionCompletions.current.set(
          message.conceptRootIdentifier,
          Date.now(),
        );
      }

      if (message.reportStatusBySection && message.conceptUuid) {
        // Update the concept cache with the new section status data
        queryClient.setQueryData<IConcept | undefined>(
          [AucctusQueryKeys.concept, message.conceptUuid],
          (existing) => {
            if (!existing || !message.reportStatusBySection) return existing;

            return {
              ...existing,
              reportStatusBySection: message.reportStatusBySection,
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
              if (!existing || !message.reportStatusBySection) return existing;
              return {
                ...existing,
                reportStatusBySection: message.reportStatusBySection,
              };
            },
          );
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

        // Show completion toast for individual sections
        // Only show toast if this is for the currently active concept
        const activeConceptUuid = useStore.getState().conceptReport.conceptUuid;
        const matchesActive =
          message.conceptUuid === activeConceptUuid ||
          message.conceptRootIdentifier === activeConceptUuid;

        if (matchesActive) {
          toast.success(
            `Section updated successfully!`,
            message.message || 'Your changes have been applied.',
            5000,
          );
        }
      }
    } else if (message.eventType === 'workflow_error') {
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
        const handler =
          config.conceptWorkflow.onWorkflowError ||
          ((msg: any) => {
            toast.error(
              'Concept Generation Failed',
              msg.message ||
                'An error occurred while generating your concept report',
            );
          });
        handler(message);
      }
    }
  });

  // Register synthetic execution completion event (GLOBAL)
  useSocketEvent<
    'synthetic.execution.progress.user',
    ISyntheticExecutionProgressMessage
  >('synthetic.execution.progress.user', (data) => {
    if (!config.syntheticTesting) return;

    // Only show toast for 100% completion
    if (data.progress >= 100) {
      const messageKey = `synthetic-complete-${data.conceptUuid}-${data.testUuid}`;
      if (preventDuplicate(messageKey)) return;

      const handler =
        config.syntheticTesting.onExecutionCompleted ||
        (() => {
          toast.completed(
            'Synthetic Testing Complete',
            'Your synthetic interviews are ready to view',
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

        toast.error(
          'Synthetic Testing Failed',
          msg.errorMessage || 'An error occurred during execution',
        );
      });

    handler(data);
  });

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
          toast.completed(
            'Documents Processed',
            msg.message || 'Your documents have been processed successfully',
          );
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

        toast.completed(
          'Documents Uploaded',
          `Successfully uploaded ${msg.uploadedCount} file${msg.uploadedCount > 1 ? 's' : ''} for processing`,
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
          toast.error(
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
          toast.completed(
            'Concepts Generated',
            `${msg.conceptCount} concepts generated!`,
          );
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
          toast.error(
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@components';
import { useSocketEvent } from './aucctus';
import { AppPath } from '@routes/routes';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../query/query-keys';
import {
  ISyntheticExecutionProgressMessage,
  ISyntheticExecutionErrorMessage,
  INucleusUploadProgressMessage,
  INucleusUploadCompletedMessage,
  INucleusUploadErrorMessage,
  INucleusAnswerProgressMessage,
  INucleusAnswerCompletedMessage,
  INucleusAnswerErrorMessage,
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

  // Prevent duplicate toasts by tracking recent messages
  const recentMessages = React.useRef(new Set<string>());

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

      const handler =
        config.conceptWorkflow.onWorkflowCompleted ||
        ((msg: any) => {
          toast.success(
            `Concept report generation completed successfully!`,
            `Click to view concept ${msg.conceptRootIdentifier}`,
            {
              autoClose: 15000,
              onClick: () => {
                const conceptUrl = AppPath.ConceptOverview.replace(
                  ':id',
                  msg.conceptRootIdentifier,
                );
                navigate(conceptUrl);
              },
            },
          );
        });
      handler(message);
    } else if (message.eventType === 'workflow_error') {
      // Check for duplicates
      const messageKey = `${message.eventType}-${message.message || 'unknown'}`;
      if (preventDuplicate(messageKey)) return;

      const handler =
        config.conceptWorkflow.onWorkflowError ||
        ((msg: any) => {
          toast.error(`Concept report generation failed`, msg.message, {
            autoClose: 10000,
          });
        });
      handler(message);
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
          toast.success(
            'Synthetic testing complete!',
            'Your synthetic interviews are ready to view.',
            {
              autoClose: 10000,
            },
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
          'Synthetic testing failed',
          msg.errorMessage || 'An error occurred during execution',
          {
            autoClose: 10000,
          },
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
          toast.success('Document processing completed!', msg.message, {
            autoClose: 5000,
          });
        } else if (msg.stage === 'processing' && msg.progress) {
          toast.info(`Processing documents: ${msg.progress}%`, msg.message, {
            autoClose: 5000,
          });
        } else if (msg.stage === 'validating') {
          toast.info('Validating uploaded documents...', msg.message, {
            autoClose: 5000,
          });
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

        toast.success(
          'Document upload completed!',
          `Successfully uploaded ${msg.uploadedCount} file${msg.uploadedCount > 1 ? 's' : ''} for processing.`,
          { autoClose: 5000 },
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
            'Document upload failed',
            msg.message || 'Please try uploading your documents again.',
            { autoClose: 5000 },
          );
        });
      handler(message);
    },
  );

  // Register nucleus answer generation progress events
  useSocketEvent<
    'nucleus_answer.progress.account',
    INucleusAnswerProgressMessage
  >('nucleus_answer.progress.account', () => {
    return;
  });

  // Register nucleus answer generation completed events
  useSocketEvent<
    'nucleus_answer.completed.account',
    INucleusAnswerCompletedMessage
  >('nucleus_answer.completed.account', (message) => {
    // Check for duplicates
    const messageKey = `nucleus-answer-completed-${message.questionUuid}-${message.answerUuid}`;
    if (preventDuplicate(messageKey)) return;

    const handler = (msg: INucleusAnswerCompletedMessage) => {
      // Show toast in the future if needed

      // Invalidate nucleus queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.nucleusReportLatest],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.nucleusReport, msg.nucleusReportUuid],
      });
    };
    handler(message);
  });

  // Register nucleus answer generation error events
  useSocketEvent<'nucleus_answer.error.account', INucleusAnswerErrorMessage>(
    'nucleus_answer.error.account',
    () => {
      return;
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
  }),
};

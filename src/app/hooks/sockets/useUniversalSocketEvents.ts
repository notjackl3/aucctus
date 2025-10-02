import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@components';
import { useSocketEvent } from './aucctus';
import { AppPath } from '@routes/routes';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../query/query-keys';
import {
  INucleusUploadProgressMessage,
  INucleusUploadCompletedMessage,
  INucleusUploadErrorMessage,
} from '@libs/api/types';

// Define event handler types
export interface ConceptWorkflowHandler {
  onWorkflowCompleted?: (message: any) => void;
  onWorkflowError?: (message: any) => void;
}

// Nucleus upload event handler types
export interface NucleusUploadHandler {
  onUploadProgress?: (message: INucleusUploadProgressMessage) => void;
  onUploadCompleted?: (message: INucleusUploadCompletedMessage) => void;
  onUploadError?: (message: INucleusUploadErrorMessage) => void;
}

// Universal socket event configuration
export interface SocketEventConfig {
  // Concept workflow events
  conceptWorkflow?: ConceptWorkflowHandler;

  // Nucleus upload events
  nucleusUpload?: NucleusUploadHandler;

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
    nucleusUpload: {
      // Uses default handlers defined in the hook
    },
  }),
};

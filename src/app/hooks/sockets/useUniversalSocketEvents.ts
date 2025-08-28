import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@components';
import { useSocketEvent } from './aucctus';
import { AppPath } from '@routes/routes';

// Define event handler types
export interface ConceptWorkflowHandler {
  onWorkflowCompleted?: (message: any) => void;
  onWorkflowError?: (message: any) => void;
}

// Universal socket event configuration
export interface SocketEventConfig {
  // Concept workflow events
  conceptWorkflow?: ConceptWorkflowHandler;

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
};

/**
 * Predefined configurations for common use cases
 */
export const socketEventConfigs = {
  // Default concept workflow handling (same as original bootstrap)
  conceptWorkflowDefault: (): SocketEventConfig => ({
    conceptWorkflow: {
      // Uses default handlers defined in the hook
    },
  }),
};

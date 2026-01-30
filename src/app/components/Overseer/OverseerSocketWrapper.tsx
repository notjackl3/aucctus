import { useSocketEvent } from '@hooks/sockets/aucctus';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import React, { useMemo } from 'react';

/**
 * Socket event wrapper for Overseer
 * Handles all incoming WebSocket events and updates the store accordingly
 *
 * Supports both concept mode (conceptUuid) and account mode (accountUuid)
 */
const OverseerSocketWrapper: React.FC = () => {
  const handleHandshake = useStore((state) => state.overseer.handleHandshake);
  const addAssistantMessage = useStore(
    (state) => state.overseer.addAssistantMessage,
  );
  const handleSuggestedQuestions = useStore(
    (state) => state.overseer.handleSuggestedQuestions,
  );
  const handleEditSuggestions = useStore(
    (state) => state.overseer.handleEditSuggestions,
  );
  const agentIsThinking = useStore((state) => state.overseer.agentIsThinking);
  const handleError = useStore((state) => state.overseer.handleError);
  const conceptUuid = useStore((state) => state.overseer.conceptUuid);
  const accountUuid = useStore((state) => state.overseer.accountUuid);
  const contextType = useStore((state) => state.overseer.contextType);

  // Get the current identifier based on context type
  // The backend sends conceptUuid as the identifier for both modes
  const currentIdentifier = useMemo(() => {
    return contextType === 'account' ? accountUuid : conceptUuid;
  }, [contextType, accountUuid, conceptUuid]);

  // Handle handshake response
  useSocketEvent('overseer.handshake', (handshake) => {
    if (handshake.conceptUuid === currentIdentifier) {
      handleHandshake(handshake);
    }
  });

  // Handle typing indicator
  useSocketEvent('overseer.chat.typing', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      agentIsThinking(message.value, message.content);
    }
  });

  // Handle chat response
  useSocketEvent('overseer.chat', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      addAssistantMessage({
        uuid: message.uuid,
        content: message.content,
        role: 'assistant',
        name: message.name,
        timestamp: message.timestamp || new Date().toISOString(),
      });
    }
  });

  // Handle streaming response (if implemented)
  useSocketEvent('overseer.chat.stream', (message) => {
    const ctx = message.context;
    if (!ctx) return;
    if (ctx.conceptUuid === currentIdentifier && message.content) {
      addAssistantMessage({
        uuid: ctx.uuid,
        content: message.content,
        role: 'assistant',
        name: ctx.name,
        timestamp: ctx.timestamp || new Date().toISOString(),
      });
    }
  });

  // Handle suggested questions
  useSocketEvent('overseer.suggested.questions', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      handleSuggestedQuestions(message.questions);
    }
  });

  // Handle tool activity notifications (e.g., "Searching the web...", "Checking Nucleus...")
  useSocketEvent('overseer.tool.activity', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      // Update the thinking message to show what tool is being used
      agentIsThinking(true, message.activityMessage);
    }
  });

  // Handle edit suggestions
  useSocketEvent('overseer.edit.suggestion', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      handleEditSuggestions(message.content);
    }
  });

  // Handle errors
  useSocketEvent('overseer.error', (error) => {
    telemetry.error('Overseer socket error', error);
    handleError({
      message: error.message,
      code: error.code,
    });
  });

  return null;
};

export default OverseerSocketWrapper;

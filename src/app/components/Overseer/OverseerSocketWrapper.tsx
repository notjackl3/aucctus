import { useSocketEvent } from '@hooks/sockets/aucctus';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import React, { useEffect, useMemo, useRef } from 'react';

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
  const handleNavigateSuggestion = useStore(
    (state) => state.overseer.handleNavigateSuggestion,
  );
  const agentIsThinking = useStore((state) => state.overseer.agentIsThinking);
  const handleError = useStore((state) => state.overseer.handleError);
  const addToolActivityStep = useStore(
    (state) => state.overseer.addToolActivityStep,
  );
  const clearToolActivitySteps = useStore(
    (state) => state.overseer.clearToolActivitySteps,
  );
  const finalizeSynthesisStep = useStore(
    (state) => state.overseer.finalizeSynthesisStep,
  );
  const handleConversationName = useStore(
    (state) => state.overseer.handleConversationName,
  );
  const conceptUuid = useStore((state) => state.overseer.conceptUuid);
  const accountUuid = useStore((state) => state.overseer.accountUuid);
  const contextType = useStore((state) => state.overseer.contextType);

  // Get the current identifier based on context type
  const currentIdentifier = useMemo(() => {
    return contextType === 'account' ? accountUuid : conceptUuid;
  }, [contextType, accountUuid, conceptUuid]);

  // Ref for synthesis delay timeout
  const synthesisTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const isCancellingState = useStore((state) => state.overseer.isCancelling);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (synthesisTimeoutRef.current) {
        clearTimeout(synthesisTimeoutRef.current);
      }
    };
  }, []);

  // Clear synthesis timeout when cancel is triggered
  useEffect(() => {
    if (isCancellingState && synthesisTimeoutRef.current) {
      clearTimeout(synthesisTimeoutRef.current);
      synthesisTimeoutRef.current = undefined;
    }
  }, [isCancellingState]);

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
      // Clear any previous pending synthesis timeout
      if (synthesisTimeoutRef.current) {
        clearTimeout(synthesisTimeoutRef.current);
      }

      const hasSteps =
        useStore.getState().overseer.toolActivitySteps.length > 0;

      const assistantMessage = {
        uuid: message.uuid,
        content: message.content,
        role: 'assistant' as const,
        name: message.name,
        timestamp: message.timestamp || new Date().toISOString(),
        ...(message.sources &&
          message.sources.length > 0 && { sources: message.sources }),
      };

      if (hasSteps) {
        // Start synthesis phase — shows "Synthesizing findings" with spinner
        clearToolActivitySteps();

        // Delay the message by 2 seconds so the synthesis step is visible
        synthesisTimeoutRef.current = setTimeout(() => {
          finalizeSynthesisStep();
          addAssistantMessage(assistantMessage);
        }, 2000);
      } else {
        // No tool steps — show message immediately
        addAssistantMessage(assistantMessage);
      }
    }
  });

  // Handle streaming response
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

  // Handle tool activity notifications — accumulate as thinking steps
  useSocketEvent('overseer.tool.activity', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      agentIsThinking(true, message.activityMessage);
      addToolActivityStep(
        message.activityMessage,
        message.detail,
        message.icon,
      );
    }
  });

  // Handle navigate suggestion — finalize tool steps with synthesis delay before showing
  useSocketEvent('overseer.navigate.suggestion', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      // Clear any previous pending synthesis timeout
      if (synthesisTimeoutRef.current) {
        clearTimeout(synthesisTimeoutRef.current);
      }

      const hasSteps =
        useStore.getState().overseer.toolActivitySteps.length > 0;

      const suggestion = {
        explanation: message.content.explanation,
        sectionId: message.content.sectionId,
        sectionName: message.content.sectionName,
        suggestedQuestions: message.content.suggestedQuestions ?? [],
      };

      if (hasSteps) {
        // Start synthesis phase — shows "Synthesizing findings" with spinner
        clearToolActivitySteps();

        // Delay the navigate suggestion by 2 seconds so synthesis step is visible
        synthesisTimeoutRef.current = setTimeout(() => {
          finalizeSynthesisStep();
          handleNavigateSuggestion(suggestion);
        }, 2000);
      } else {
        handleNavigateSuggestion(suggestion);
      }
    }
  });

  // Handle edit suggestions — finalize tool steps with synthesis delay before showing
  useSocketEvent('overseer.edit.suggestion', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      // Clear any previous pending synthesis timeout
      if (synthesisTimeoutRef.current) {
        clearTimeout(synthesisTimeoutRef.current);
      }

      const hasSteps =
        useStore.getState().overseer.toolActivitySteps.length > 0;

      if (hasSteps) {
        // Start synthesis phase — shows "Synthesizing findings" with spinner
        clearToolActivitySteps();

        // Delay the edit suggestions by 2 seconds so synthesis step is visible
        synthesisTimeoutRef.current = setTimeout(() => {
          finalizeSynthesisStep();
          handleEditSuggestions(message.content);
        }, 2000);
      } else {
        handleEditSuggestions(message.content);
      }
    }
  });

  // Handle conversation name
  useSocketEvent('overseer.conversation.name', (message) => {
    if (message.conceptUuid === currentIdentifier) {
      handleConversationName({
        sessionId: message.sessionId,
        name: message.name,
      });
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

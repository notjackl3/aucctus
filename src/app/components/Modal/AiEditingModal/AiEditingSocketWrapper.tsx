/* eslint-disable no-console */
import { useSocketEvent } from '@hooks/sockets/aucctus';
import {
  AiEditingChatStreamEvent,
  IAiEditingInboundChatMessage,
  IAiEditingSuggestionsEvent,
  IAiEditingSuggestionsStreamEvent,
} from '@libs/api/types';
import { isDirectMessage, isStreamEvent } from '@libs/api/utils/typeGuards';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import React from 'react';

interface AiEditingSocketWrapperProps {}

const AiEditingSocketWrapper: React.FC<AiEditingSocketWrapperProps> = ({}) => {
  const handleAiEditingHandshake = useStore(
    (state) => state.aiEditing.handleAiEditingMessage,
  );
  const addAssistantMessage = useStore(
    (state) => state.aiEditing.addAssistantMessage,
  );
  const agentIsThinking = useStore((state) => state.aiEditing.agentIsThinking);
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);

  const processMessage = React.useCallback(
    (
      message:
        | IAiEditingSuggestionsEvent
        | IAiEditingInboundChatMessage
        | IAiEditingSuggestionsStreamEvent
        | AiEditingChatStreamEvent,
    ) => {
      // For direct messages
      if (isDirectMessage(message)) {
        if (message.conceptUuid === conceptUuid) {
          addAssistantMessage({
            uuid: message.uuid,
            content: message.content,
            role: 'assistant',
            name: message.name,
            timestamp: message.timestamp || Date.now(),
          });
        }
      }
      // For stream events
      else if (isStreamEvent(message)) {
        if (message.context.conceptUuid === conceptUuid && message.content) {
          addAssistantMessage({
            uuid: message.context.uuid,
            content: message.content,
            role: 'assistant',
            name: message.context.name,
            timestamp: message.context.timestamp,
          });
        }
      }
    },
    [addAssistantMessage, conceptUuid],
  );

  useSocketEvent('ai.editing.handshake', (handshake) => {
    handleAiEditingHandshake(handshake);
  });

  useSocketEvent('ai.editing.error', (message) => {
    telemetry.error('ai.editing.error', message);
    // TODO: Create action to show error message in chat
  });

  useSocketEvent('ai.editing.chat.typing', (message) => {
    if (message.conceptUuid === conceptUuid) {
      agentIsThinking(message.value, message.content);
    }
  });

  // Apply the helper function to all socket events that add assistant messages
  useSocketEvent('ai.editing.edit.suggestion', processMessage);
  useSocketEvent('ai.editing.chat', processMessage);
  useSocketEvent('ai.editing.chat.stream', processMessage);
  useSocketEvent('stream.ai.editing.edit.suggestion', processMessage);

  return <></>;
};

export default AiEditingSocketWrapper;

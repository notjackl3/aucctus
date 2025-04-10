/* eslint-disable no-console */
import { useSocketEvent } from '@hooks/sockets/aucctus';
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

  useSocketEvent('ai.editing.edit.suggestion', (message) => {
    if (message.conceptUuid === conceptUuid) {
      addAssistantMessage({
        // The uuid is not defined until the stream is done
        // This is the uuid that is used when saving the message to the conversation.
        uuid: message.uuid,
        content: message.content,
        role: 'assistant',
        name: message.name,
        timestamp: message.timestamp,
      });
    }
  });

  useSocketEvent('ai.editing.chat', (message) => {
    if (message.conceptUuid === conceptUuid) {
      addAssistantMessage({
        uuid: message.uuid,
        content: message.content,
        role: 'assistant',
        name: message.name,
        timestamp: message.timestamp,
      });
    }
  });

  return <></>;
};

export default AiEditingSocketWrapper;

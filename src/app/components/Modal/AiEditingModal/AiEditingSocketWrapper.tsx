/* eslint-disable no-console */
import { useSocketEvent } from '@hooks/sockets/aucctus';
import useStore from '@stores/store';
import React from 'react';
// import { toast } from 'react-toastify';
interface AiEditingSocketWrapperProps {}

const AiEditingSocketWrapper: React.FC<AiEditingSocketWrapperProps> = ({}) => {
  const handleAiEditingHandshake = useStore(
    (state) => state.aiEditing.handleAiEditingMessage,
  );
  const addAssistantMessage = useStore(
    (state) => state.aiEditing.addAssistantMessage,
  );
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);

  const agentIsTyping = useStore((state) => state.aiEditing.agentIsTyping);

  useSocketEvent('ai.editing.handshake', (handshake) => {
    handleAiEditingHandshake(handshake);
  });

  useSocketEvent('ai.editing.error', (message) => {
    console.error('ai.editing.error', message);
    // agentIsTyping(false);
    // toast.error(`The following error occurred when processing your edit request: ${message.message}`);
  });

  useSocketEvent('ai.editing.chat', (message) => {
    console.log('ai.editing.chat', message);
  });

  useSocketEvent('ai.editing.chat.typing', (message) => {
    if (message.conceptUuid === conceptUuid) {
      agentIsTyping(message.value);
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
        // Note these are unique to each call
        agentId: message.sessionId,
      });
    }
  });

  return <></>;
};

export default AiEditingSocketWrapper;

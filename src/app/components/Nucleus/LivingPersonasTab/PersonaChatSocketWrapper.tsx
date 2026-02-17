import { useSocketEvent } from '@hooks/sockets/aucctus';
import { personaKeys } from '@hooks/query/persona.hook';
import type {
  IPersonaChatErrorMessage,
  IPersonaChatHandshakeMessage,
  IPersonaChatInboundMessage,
  IPersonaChatStreamEvent,
  IPersonaChatTypingMessage,
} from '@libs/api/types/socketMessages/inbound';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import React from 'react';
import { useQueryClient } from 'react-query';

const PersonaChatSocketWrapper: React.FC = () => {
  const queryClient = useQueryClient();
  const handleHandshake = useStore(
    (state) => state.personaConversations.handleHandshake,
  );
  const addAssistantMessage = useStore(
    (state) => state.personaConversations.addAssistantMessage,
  );
  const addErrorMessage = useStore(
    (state) => state.personaConversations.addErrorMessage,
  );
  const agentIsThinking = useStore(
    (state) => state.personaConversations.agentIsThinking,
  );
  const handleStream = useStore(
    (state) => state.personaConversations.handleStream,
  );
  const personaUuid = useStore(
    (state) => state.personaConversations.personaUuid,
  );

  // Handle handshake (new conversation created)
  useSocketEvent(
    'living_personas.chat.handshake',
    React.useCallback(
      (data: IPersonaChatHandshakeMessage) => {
        telemetry.debug('[PersonaChat] handshake received', {
          dataPersonaUuid: data.personaUuid,
          storePersonaUuid: personaUuid,
          sessionId: data.sessionId,
          match: data.personaUuid === personaUuid,
          timestamp: Date.now(),
        });
        if (data.personaUuid !== personaUuid) return;
        handleHandshake(data);
        queryClient.invalidateQueries(personaKeys.chatSessions(personaUuid));
      },
      [personaUuid, handleHandshake, queryClient],
    ),
  );

  // Handle final assistant messages
  useSocketEvent(
    'living_personas.chat.message',
    React.useCallback(
      (data: IPersonaChatInboundMessage) => {
        telemetry.debug('[PersonaChat] message received', {
          dataPersonaUuid: data.personaUuid,
          storePersonaUuid: personaUuid,
          messageUuid: data.uuid,
          match: data.personaUuid === personaUuid,
          contentPreview: data.content?.slice(0, 50),
          timestamp: Date.now(),
        });
        if (data.personaUuid !== personaUuid) return;
        telemetry.debug('[PersonaChat] message accepted, adding to store', {
          messageUuid: data.uuid,
          timestamp: Date.now(),
        });
        addAssistantMessage({
          uuid: data.uuid,
          content: data.content,
          role: 'assistant',
          name: data.name,
          timestamp: data.timestamp || new Date().toISOString(),
        });
      },
      [personaUuid, addAssistantMessage],
    ),
  );

  // Handle streaming chunks
  useSocketEvent(
    'living_personas.chat.stream',
    React.useCallback(
      (data: IPersonaChatStreamEvent) => {
        telemetry.debug('[PersonaChat] stream chunk received', {
          dataPersonaUuid: data.personaUuid,
          storePersonaUuid: personaUuid,
          messageUuid: data.messageUuid,
          isFinal: data.isFinal,
          match: data.personaUuid === personaUuid,
          contentLength: data.content?.length,
          timestamp: Date.now(),
        });
        if (data.personaUuid !== personaUuid) return;
        handleStream(data);
      },
      [personaUuid, handleStream],
    ),
  );

  // Handle typing indicator
  useSocketEvent(
    'living_personas.chat.typing',
    React.useCallback(
      (data: IPersonaChatTypingMessage) => {
        telemetry.debug('[PersonaChat] typing indicator', {
          dataPersonaUuid: data.personaUuid,
          storePersonaUuid: personaUuid,
          isTyping: data.isTyping,
          match: data.personaUuid === personaUuid,
          timestamp: Date.now(),
        });
        if (data.personaUuid !== personaUuid) return;
        agentIsThinking(data.isTyping);
      },
      [personaUuid, agentIsThinking],
    ),
  );

  // Handle errors
  useSocketEvent(
    'living_personas.chat.error',
    React.useCallback(
      (data: IPersonaChatErrorMessage) => {
        telemetry.debug('[PersonaChat] error received', {
          dataPersonaUuid: data.personaUuid,
          storePersonaUuid: personaUuid,
          error: data.error,
          message: data.message,
          match: data.personaUuid === personaUuid,
          timestamp: Date.now(),
        });
        if (data.personaUuid !== personaUuid) return;
        telemetry.error('living_personas.chat.error', data);
        agentIsThinking(false);

        addErrorMessage({
          uuid: `error-${Date.now()}`,
          content: data.message || 'Something went wrong. Please try again.',
          role: 'error',
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          code: data.error || 'UNKNOWN',
        });
      },
      [personaUuid, agentIsThinking, addErrorMessage],
    ),
  );

  return <></>;
};

export default PersonaChatSocketWrapper;

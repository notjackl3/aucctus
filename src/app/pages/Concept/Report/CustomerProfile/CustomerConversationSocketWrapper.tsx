/* eslint-disable no-console */
import { useSocketEvent } from '@hooks/sockets/aucctus';
import {
  ICustomerProfileHandshakeMessage,
  ICustomerProfileInboundChatMessage,
  ICustomerProfileInboundErrorEvent,
  ICustomerProfileInboundTypingMessage,
} from '@libs/api/types';
import { isCustomerProfileDirectMessage } from '@libs/api/utils/typeGuards';
import { CustomerProfileConversationEvent } from '@libs/events/CustomerProfileConversationEvent';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import React from 'react';

interface CustomerConversationSocketWrapperProps {}

const CustomerConversationSocketWrapper: React.FC<
  CustomerConversationSocketWrapperProps
> = ({}) => {
  const handleMessage = useStore(
    (state) => state.customerProfileConversations.handleMessage,
  );
  const addAssistantMessage = useStore(
    (state) => state.customerProfileConversations.addAssistantMessage,
  );
  const addErrorMessage = useStore(
    (state) => state.customerProfileConversations.addErrorMessage,
  );
  const agentIsThinking = useStore(
    (state) => state.customerProfileConversations.agentIsThinking,
  );
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);
  const sessionId = useStore(
    (state) => state.customerProfileConversations.sessionId,
  );

  const processMessage = React.useCallback(
    (message: ICustomerProfileInboundChatMessage) => {
      // For direct messages
      if (isCustomerProfileDirectMessage(message)) {
        if (
          message.conceptUuid === conceptUuid &&
          message.sessionId === sessionId
        ) {
          addAssistantMessage({
            uuid: message.uuid,
            content: message.content,
            role: 'assistant',
            name: message.name,
            timestamp: message.timestamp || new Date().toISOString(),
          });
          agentIsThinking(false);
        }
      }
      // // For stream events
      // else if (isCustomerProfileStreamEvent(message)) {
      //   if (message.context.conversationUuid === conceptUuid && message.content) {
      //     addAssistantMessage({
      //       agentId: message.context.name || 'Aucctus',
      //       uuid: message.context.uuid,
      //       content: message.content,
      //       role: 'assistant',
      //     });
      //   }
      // }
    },
    [addAssistantMessage, conceptUuid, agentIsThinking, sessionId],
  );

  useSocketEvent(
    'customer.profile.handshake',
    (handshake: ICustomerProfileHandshakeMessage) => {
      const handshakeSuccess = handleMessage(handshake);

      if (handshakeSuccess) {
        CustomerProfileConversationEvent.dispatch({
          sessionId: handshake.sessionId,
        });
      }
    },
  );

  useSocketEvent(
    'customer.profile.error',
    (message: ICustomerProfileInboundErrorEvent) => {
      telemetry.error('customer.profile.error', message);
      agentIsThinking(false);

      // Add error message to chat
      const errorMessage = {
        uuid: `error-${Date.now()}`,
        content: message.message || 'Something went wrong. Please try again.',
        role: 'error' as const,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        code: message.code || 'UNKNOWN',
      };

      addErrorMessage(errorMessage);
    },
  );

  useSocketEvent(
    'customer.profile.chat.typing',
    (message: ICustomerProfileInboundTypingMessage) => {
      if (
        message.conceptUuid === conceptUuid &&
        message.sessionId === sessionId
      ) {
        agentIsThinking(message.value);
      }
    },
  );

  // Apply the helper function to all socket events that add assistant messages
  useSocketEvent('customer.profile.chat', processMessage);
  // useSocketEvent('customer.profile.chat.stream', processMessage);

  return <></>;
};

export default CustomerConversationSocketWrapper;

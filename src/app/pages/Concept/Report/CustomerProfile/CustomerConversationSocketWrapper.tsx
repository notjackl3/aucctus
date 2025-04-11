/* eslint-disable no-console */
import { useSocketEvent } from '@hooks/sockets/aucctus';
import {
  ICustomerProfileHandshakeMessage,
  ICustomerProfileInboundChatMessage,
  ICustomerProfileInboundTypingMessage,
} from '@libs/api/types';
import { isCustomerProfileDirectMessage } from '@libs/api/utils/typeGuards';
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
  const agentIsThinking = useStore(
    (state) => state.customerProfileConversations.agentIsThinking,
  );
  const conceptUuid = useStore((state) => state.conceptReport.conceptUuid);

  const processMessage = React.useCallback(
    (message: ICustomerProfileInboundChatMessage) => {
      // For direct messages
      if (isCustomerProfileDirectMessage(message)) {
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
    [addAssistantMessage, conceptUuid],
  );

  useSocketEvent(
    'customer.profile.handshake',
    (handshake: ICustomerProfileHandshakeMessage) => {
      handleMessage(handshake);
    },
  );

  useSocketEvent('customer.profile.chat.error', (message) => {
    telemetry.error('customer.profile.chat.error', message);
    // TODO: Create action to show error message in chat
  });

  useSocketEvent(
    'customer.profile.chat.typing',
    (message: ICustomerProfileInboundTypingMessage) => {
      if (message.conceptUuid === conceptUuid) {
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

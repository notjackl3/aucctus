import React, { useCallback } from 'react';
import { cn } from '@libs/utils/react';
import { ICustomerProfileConversation } from '@libs/api/types';
import SelectableCustomerConversation from './SelectableCustomerConversation';
import useStore from '@stores/store';

interface SelectableCustomerConversationListProps {
  conversations?: ICustomerProfileConversation[];
  onSelectConversation: (conversation: ICustomerProfileConversation) => void;
  className?: string;
}

const SelectableCustomerConversationList: React.FC<
  SelectableCustomerConversationListProps
> = ({ conversations, onSelectConversation, className }) => {
  const sessionId = useStore(
    (state) => state.customerProfileConversations.sessionId,
  );

  // Check if a conversation is active
  const isConversationActive = useCallback(
    (conversation: ICustomerProfileConversation) => {
      return conversation.uuid === sessionId;
    },
    [sessionId],
  );

  // Render
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(conversations || [])
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ) // need this to handle handshake scenario
        .map((conversation) => (
          <SelectableCustomerConversation
            key={conversation.uuid}
            conversation={conversation}
            onClick={() => onSelectConversation(conversation)}
            isActive={isConversationActive(conversation)}
          />
        ))}
    </div>
  );
};

export default SelectableCustomerConversationList;

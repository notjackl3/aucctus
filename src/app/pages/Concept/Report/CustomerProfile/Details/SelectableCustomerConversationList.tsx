import { cn } from '@libs/utils/react';
import { ICustomerProfileConversation } from '@stores/customer_profile_conversations/store';
import React, { useCallback } from 'react';
import SelectableCustomerConversation from './SelectableCustomerConversation';

interface SelectableCustomerConversationListProps {
  conversations?: ICustomerProfileConversation[];
  activeConversation?: ICustomerProfileConversation;
  onSelectConversation: (conversation: ICustomerProfileConversation) => void;
  className?: string;
}

const SelectableCustomerConversationList: React.FC<
  SelectableCustomerConversationListProps
> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  className,
}) => {
  // Check if a conversation is active
  const isConversationActive = useCallback(
    (conversation: ICustomerProfileConversation) => {
      return conversation.uuid === activeConversation?.uuid;
    },
    [activeConversation],
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

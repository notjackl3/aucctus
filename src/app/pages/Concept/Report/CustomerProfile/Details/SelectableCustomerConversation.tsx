import React, { useMemo } from 'react';
import { cn } from '@libs/utils/react';
import { ICustomerProfileConversation } from '@libs/api/types';
import { formatDate } from '@libs/utils/time';

/**
 * Props for the SelectableCustomerConversation component
 * @property {boolean} isActive - Whether this conversation is currently selected
 * @property {ICustomerProfileConversation} conversation - The conversation data to display
 * @property {() => void} onClick - Handler for when the conversation is clicked
 */
interface SelectableCustomerConversationProps {
  isActive: boolean;
  conversation: ICustomerProfileConversation;
  onClick: () => void;
}

/**
 * Renders a selectable conversation item in the customer profile
 * Displays the conversation date and summary with appropriate styling
 */
const SelectableCustomerConversation: React.FC<
  SelectableCustomerConversationProps
> = ({ isActive, conversation, onClick }) => {
  // Format the date using the formatDate utility function
  const formattedDate = useMemo(() => {
    try {
      return formatDate(conversation.createdAt);
    } catch (error) {
      return 'Invalid date';
    }
  }, [conversation.createdAt]);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg p-2 text-left transition-all duration-200',
        {
          'aucctus-bg-secondary-hover': !isActive,
          'aucctus-bg-quaternary': isActive,
        },
      )}
      aria-pressed={isActive}
    >
      <span className='aucctus-text-primary aucctus-text-xs block truncate'>
        {formattedDate}
      </span>
      {conversation.summary && (
        <span className='aucctus-text-tertiary aucctus-text-xs mt-1 block truncate'>
          {conversation.summary}
        </span>
      )}
    </button>
  );
};

export default SelectableCustomerConversation;

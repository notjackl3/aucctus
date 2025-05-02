import React from 'react';
import { Icon } from '@components';
import { formatDate } from '@libs/utils/time';
import {
  ICustomerProfileConversation,
  ICustomerProfileConversationSearchResult,
} from '@libs/api/types/concept/concepts';

interface ConversationSearchResultProps {
  result: ICustomerProfileConversationSearchResult;
  index: number;
  onClick?: (conversation: ICustomerProfileConversation) => void;
}

const ConversationSearchResult: React.FC<ConversationSearchResultProps> = ({
  result,
  index,
  onClick,
}) => {
  return (
    <div
      style={{ animationDelay: `${index * 0.1}s` }}
      className='aucctus-bg-primary-hover flex animate-fade-in cursor-pointer flex-row gap-2 rounded-md p-3 opacity-0'
      onClick={() => onClick?.(result.conversation)}
    >
      <span className='flex items-center justify-center'>
        <Icon variant='message-circle' width={20} height={20} />
      </span>
      <div className='flex flex-col'>
        {result.conversation.summary && (
          <span className='aucctus-text-sm-semibold aucctus-text-primary'>
            {result.conversation.summary}
          </span>
        )}
        <span className='aucctus-text-xs aucctus-text-tertiary'>
          {`...${result.messageSnippet}...`}
        </span>
      </div>
      <span className='flex flex-1' />
      <span className='aucctus-text-xs aucctus-text-tertiary self-end'>
        {formatDate(result.conversation.createdAt)}
      </span>
    </div>
  );
};

export default ConversationSearchResult;

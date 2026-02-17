import {
  IAggregatedMessage,
  ICustomerProfileConversation,
} from '@libs/api/types';
import { formatDate } from '@libs/utils/time';
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ConversationSearchResultProps {
  result: ICustomerProfileConversation;
  index: number;
  onClick?: (conversation: ICustomerProfileConversation) => void;
}

const ConversationSearchResult: React.FC<ConversationSearchResultProps> = ({
  result,
  index,
  onClick,
}) => {
  const getSnippet = (message: IAggregatedMessage) => {
    const snippet = message.messageSnippet || message.content.slice(0, 25);
    return snippet;
  };

  return (
    <div
      style={{ animationDelay: `${index * 0.1}s` }}
      className='aucctus-bg-primary-hover flex animate-fade-in cursor-pointer flex-row gap-2 rounded-md p-3 opacity-0'
      onClick={() => onClick?.(result)}
    >
      <span className='flex items-center justify-center'>
        <MessageCircle size={20} />
      </span>
      <div className='flex flex-col'>
        {result.summary && (
          <span className='aucctus-text-sm-semibold aucctus-text-primary'>
            {result.summary}
          </span>
        )}
        <span className='aucctus-text-xs aucctus-text-tertiary'>
          {getSnippet(result.message)}
        </span>
      </div>
      <span className='flex flex-1' />
      <span className='aucctus-text-xs aucctus-text-tertiary self-end'>
        {formatDate(result.createdAt)}
      </span>
    </div>
  );
};

export default ConversationSearchResult;

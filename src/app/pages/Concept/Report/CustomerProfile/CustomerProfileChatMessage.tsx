import React from 'react';
import AiFrostedCard from '@components/AiInteraction/AiFrostedCard';
import { CustomerProfileMessage } from '@libs/api/types';

interface CustomerProfileChatMessage {
  agentId: string;
  uuid: string;
  role: 'user' | 'assistant';
  content: string;
}

interface CustomerProfileChatMessageProps {
  message: CustomerProfileMessage;
}

/**
 * MessageRenderer - Renders different message types in the AI editing conversation
 * based on the role (user or assistant).
 */
const CustomerProfileChatMessage: React.FC<CustomerProfileChatMessageProps> = ({
  message,
}) => {
  if (message.role === 'user') {
    return (
      <div className='mb-2 flex flex-1 animate-expand flex-row'>
        <div className='flex flex-1' />
        <AiFrostedCard message={message.content} className='mx-4' />
      </div>
    );
  }

  return (
    <div className='mb-2 flex flex-1 animate-expand flex-row'>
      <AiFrostedCard
        message={message.content}
        className='mx-4'
        variant='dark'
      />
      <div className='flex flex-1' />
    </div>
  );
};

export default CustomerProfileChatMessage;

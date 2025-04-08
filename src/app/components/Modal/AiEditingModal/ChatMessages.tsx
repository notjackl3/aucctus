import React from 'react';
import AiFrostedCard from '@components/Card/ConceptGeneration/AiExploration/AiFrostedCard';
import AgentMessageCard from './AgentMessageCard';
import { EditMessage } from '@stores/ai-editing/store';
import { IConceptReportEdit } from '@libs/api/types';

interface ChatMessagesProps {
  message: EditMessage;
  isLastMessage: boolean;
  onConfirmation: (
    content: IConceptReportEdit | Partial<IConceptReportEdit>,
  ) => void;
  onRejection: () => void;
}

/**
 * MessageRenderer - Renders different message types in the AI editing conversation
 * based on the role (user or assistant).
 */
const ChatMessages: React.FC<ChatMessagesProps> = ({
  message,
  isLastMessage,
  onConfirmation,
  onRejection,
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
      <AgentMessageCard
        message={message.content}
        isActiveAiEditMessage={isLastMessage}
        onConfirmation={() => onConfirmation(message.content)}
        onRejection={onRejection}
      />
    </div>
  );
};

export default ChatMessages;

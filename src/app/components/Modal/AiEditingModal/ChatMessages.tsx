import AiFrostedCard from '@components/Card/ConceptGeneration/AiExploration/AiFrostedCard';
import { IConceptReportEdit } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { EditMessage } from '@stores/ai-editing/store';
import React from 'react';
import AgentMessageCard from './AgentMessageCard';
interface ChatMessagesProps {
  message: EditMessage;
  isLastMessage: boolean;
  onConfirmation: (
    content: IConceptReportEdit | Partial<IConceptReportEdit>,
  ) => void;
  onRejection: () => void;
  className?: string;
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
  className,
}) => {
  if (message.role === 'user') {
    return (
      <div
        className={cn(
          'mb-2 flex w-full animate-expand flex-row justify-end',
          className,
        )}
      >
        <AiFrostedCard
          message={message.content}
          variant='light'
          className='mx-4'
        />
      </div>
    );
  }

  return (
    <div className='mb-2 flex animate-expand flex-row'>
      {typeof message.content === 'string' ? (
        <AiFrostedCard
          message={message.content}
          variant='dark'
          className='mx-4'
        />
      ) : (
        <AgentMessageCard
          message={message.content}
          isActiveAiEditMessage={isLastMessage}
          onConfirmation={() =>
            onConfirmation(
              message.content as
                | IConceptReportEdit
                | Partial<IConceptReportEdit>,
            )
          }
          onRejection={onRejection}
        />
      )}
    </div>
  );
};

export default ChatMessages;

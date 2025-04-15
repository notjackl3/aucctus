import AiFrostedCard from '@components/AiInteraction/AiFrostedCard';
import { IConceptReportEdit } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { EditMessage } from '@stores/ai-editing/store';
import React from 'react';
import AiEditingAgentMessageCard from './AiEditingAgentMessageCard';

interface AiEditingChatMessageProps {
  message: EditMessage;
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
const AiEditingChatMessage: React.FC<AiEditingChatMessageProps> = ({
  message,
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
        <AiEditingAgentMessageCard
          className='mx-4'
          message={message.content}
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
      <span className='flex-1' />
    </div>
  );
};

export default AiEditingChatMessage;

import AiFrostedCard from '@components/AiInteraction/AiFrostedCard';
import Icon from '@components/Icon';
import { IConceptReportEdit } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { EditMessage } from '@stores/ai-editing/store';
import React from 'react';
import AiEditingAgentMessageCard from './AiEditingAgentMessageCard';

// Constants
const SYSTEM_ERROR_MESSAGE_NAME = 'system_error';

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

  // Check if this is an error message
  const isSystemError = message.name === SYSTEM_ERROR_MESSAGE_NAME;

  if (isSystemError) {
    return (
      <div
        className='mb-2 flex animate-expand flex-row'
        role='alert'
        aria-live='polite'
      >
        <div
          className={cn(
            'mx-4 flex flex-row items-start gap-3 rounded-lg p-4',
            'aucctus-bg-error-secondary aucctus-text-error-primary',
          )}
        >
          <Icon
            variant='alert-triangle'
            className='mt-0.5 h-5 w-5 flex-shrink-0 stroke-current'
          />
          <div className='flex-1 text-sm'>
            {typeof message.content === 'string'
              ? message.content
              : 'An error occurred'}
          </div>
        </div>
        <span className='flex-1' />
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
          onConfirmation={(editedMessage) => onConfirmation(editedMessage)}
          onRejection={onRejection}
        />
      )}
      <span className='flex-1' />
    </div>
  );
};

export default AiEditingChatMessage;

import React, { useMemo } from 'react';
import { IConceptReportEdit } from '@libs/api/types';
import AiEditingChatMessage from './AiEditingChatMessage';
import FrostedLoadingCard from '../../AiInteraction/FrostedLoadingCard';
import { EditMessage } from '@stores/ai-editing/store';

interface AiEditingConversationProps {
  messages: EditMessage[];
  onConfirmation: (
    edit: IConceptReportEdit | Partial<IConceptReportEdit>,
  ) => void;
  onRejection: (clearMessages?: boolean) => void;
}

/**
 * AiEditingConversation - A component that displays the conversation history
 * between the user and AI in the AI editing flow.
 */
const AiEditingConversation: React.FC<AiEditingConversationProps> = ({
  messages,
  onConfirmation,
  onRejection,
}) => {
  // Derived state
  const isThinking = useMemo(() => {
    return messages.length > 0 && messages[messages.length - 1].role === 'user';
  }, [messages]);

  return (
    <div className='no-scrollbar flex !max-h-[90%] flex-col gap-4'>
      {messages.map((message) => (
        <div key={message.uuid} className='flex flex-row gap-4'>
          <AiEditingChatMessage
            message={message}
            onConfirmation={onConfirmation}
            onRejection={onRejection}
          />
        </div>
      ))}

      {/* Loading indicator when AI is thinking */}
      {isThinking && (
        <div
          style={{ animationDelay: `1000ms` }}
          className='mx-4 flex animate-expand flex-row gap-4'
        >
          <FrostedLoadingCard
            variant='dark'
            className='flex-1'
            defaultMessage='Got it, processing your feedback...'
          />
        </div>
      )}
    </div>
  );
};

export default AiEditingConversation;

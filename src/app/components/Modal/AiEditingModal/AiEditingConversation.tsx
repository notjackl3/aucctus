import FrostedLoadingCard from '@components/AiInteraction/FrostedLoadingCard';
import { IConceptReportEdit } from '@libs/api/types';
import React, { useEffect, useCallback } from 'react';
import { animated, useTransition } from 'react-spring';
import AiEditingChatMessage from './AiEditingChatMessage';

interface AiEditingConversationProps {
  showConversation: boolean;
  messages: any[]; // Replace with proper type
  thinkingMessage?: string;
  isThinking: boolean;
  onConfirmation: (
    edit: IConceptReportEdit | Partial<IConceptReportEdit>,
  ) => void;
  onRejection: () => void;
}

/**
 * AiEditingConversation - A component that displays the conversation history
 * between the user and AI in the AI editing flow.
 */
const AiEditingConversation: React.FC<AiEditingConversationProps> = ({
  showConversation,
  messages,
  isThinking,
  thinkingMessage,
  onConfirmation,
  onRejection,
}) => {
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Calculate container height when messages change
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const lastChild = messagesContainerRef.current.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isThinking]);

  const loadingTransition = useTransition(isThinking, {
    from: {
      opacity: 0,
      transform: 'translateY(40px) scale(0.9)',
      maxHeight: '0px',
    },
    enter: {
      opacity: 1,
      transform: 'translateY(0px) scale(1)',
      maxHeight: '100px',
    },
    leave: {
      opacity: 0,
      transform: 'translateY(40px) scale(0.9)',
      maxHeight: '0px',
    },
    config: {
      tension: 220,
      friction: 30,
      mass: 1,
    },
  });

  return (
    <div className='flex h-full flex-1 flex-col overflow-hidden'>
      <div className='flex h-full flex-col justify-end overflow-auto'>
        <div
          ref={messagesContainerRef}
          className='no-scrollbar w-full scroll-smooth'
        >
          {/* Conversation history */}
          {showConversation
            ? messages.map((message) => (
                <AiEditingChatMessage
                  key={message.uuid}
                  message={message}
                  onConfirmation={onConfirmation}
                  onRejection={onRejection}
                />
              ))
            : null}
        </div>
      </div>
      {/* Loading indicator when AI is thinking */}
      {loadingTransition(
        (style, item) =>
          item && (
            <animated.div
              style={style}
              className='mx-4 flex h-fit flex-row gap-4 overflow-hidden'
            >
              <FrostedLoadingCard
                variant='dark'
                className='flex-1'
                defaultMessage='Got it, processing your feedback...'
                message={thinkingMessage}
              />
            </animated.div>
          ),
      )}
    </div>
  );
};

export default AiEditingConversation;

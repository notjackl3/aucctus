import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { cn } from '@libs/utils/react';
import { ICustomerProfile } from '@libs/api/types';
import Icon from '@components/Icon/Icon/Icon';
import AiInteractionDiv from '@components/AiInteraction/AiInteractionDiv';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import { animated, useTransition } from 'react-spring';
import FrostedLoadingCard from '@components/AiInteraction/FrostedLoadingCard';
import AiIntroMessage from '@components/AiInteraction/AiIntroMessage';
import CustomerProfileChatMessage from './CustomerProfileChatMessage';
import useStore from '@stores/store';

interface ConversationWindowProps {
  profile: ICustomerProfile;
  introMessage?: string;
  height?: number;
  onClose: () => void;
}

const ConversationWindow: React.FC<ConversationWindowProps> = ({
  profile,
  onClose,
  height = 500,
}) => {
  // Store hooks - group related state together
  const {
    sendMessage,
    messages,
    currentMessage,
    setCurrentMessage,
    clearConversation,
  } = useStore((state) => state.customerProfileConversations);

  // Cleanup effect
  useEffect(() => {
    return () => {
      clearConversation();
    };
  }, [clearConversation]);

  // Derived state
  const isThinking = useMemo(() => {
    return messages.length > 0 && messages[messages.length - 1].role === 'user';
  }, [messages]);

  // Refs
  const conversationRef = useRef<HTMLDivElement>(null);

  // Animations
  const transition = useTransition(messages.length === 0, {
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0 },
    config: { tension: 280, friction: 60 },
  });

  // Scroll handling
  const scrollToBottom = useCallback((delay = 300) => {
    setTimeout(() => {
      if (conversationRef.current) {
        // Find the last message element
        const lastMessage = conversationRef.current
          .lastElementChild as HTMLElement;

        if (lastMessage) {
          lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          conversationRef.current.scrollTop =
            conversationRef.current.scrollHeight;
        }
      }
    }, delay);
  }, []);

  // MutationObserver for content changes
  useEffect(() => {
    if (!conversationRef.current) return;

    const observer = new MutationObserver(() => scrollToBottom());

    observer.observe(conversationRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    scrollToBottom();

    return () => observer.disconnect();
  }, [scrollToBottom]);

  // Scroll on messages or thinking state change
  useEffect(() => {
    if (isThinking) {
      scrollToBottom(1100); // Match the animation delay (1000ms) plus a little extra
    } else {
      scrollToBottom();
    }
  }, [messages, isThinking, scrollToBottom]);

  // Handle message submission
  const handleSubmitMessage = async () => {
    await sendMessage();
  };

  // Handle message input change
  const handleMessageChange = (value: string) => {
    setCurrentMessage(value);
  };

  return (
    <AiInteractionDiv
      style={{ height: `${height}px` }}
      className={cn(
        'w-80 rounded-lg shadow-xl sm:w-96',
        'flex flex-col overflow-hidden',
      )}
    >
      {/* Header */}
      <div className='m-4 flex flex-row gap-4'>
        <span className='aucctus-text-lg aucctus-text-white'>
          {profile.name}
        </span>
        <span className='flex-1' />
        <button
          onClick={onClose}
          className={cn(
            'aspect-square w-6 rounded-lg',
            'transition-all duration-200',
            'hover:bg-gray-light-100 hover:bg-opacity-20',
          )}
          aria-label='Close conversation'
        >
          <span className='flex items-center justify-center'>
            <Icon
              variant='closeX'
              width={20}
              height={20}
              className='stroke-gray-light-300'
            />
          </span>
        </button>
      </div>

      {/* Conversation area */}
      <div
        ref={conversationRef}
        className='no-scrollbar flex flex-1 flex-col scroll-smooth px-4'
        aria-live='polite'
      >
        {/* Intro message (shown when no messages exist) */}
        {transition(
          (style, item) =>
            item && (
              <animated.div
                style={style}
                className='flex flex-1 flex-col items-center justify-center'
              >
                <AiIntroMessage
                  title={`Hi there, my name is ${profile.name.split(' ')[0]}!`}
                  subtitle={`Ask me anything about your concept...`}
                />
              </animated.div>
            ),
        )}

        <span className='flex-1' />

        {/* Message history */}
        {messages.map((message) => (
          <div key={message.uuid} className='flex flex-row gap-4'>
            <CustomerProfileChatMessage message={message} />
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className='relative m-4 w-auto'>
        {/* Loading indicator */}
        {isThinking && (
          <div
            style={{ animationDelay: `1000ms` }}
            className='mx-4 mb-4 flex animate-expand flex-row gap-4'
          >
            <FrostedLoadingCard variant='dark' />
          </div>
        )}
        <AucctusMessageInput
          value={currentMessage ?? ''}
          onChange={(e) => handleMessageChange(e.target.value)}
          onSubmitMessage={handleSubmitMessage}
          allowSubmitMessage={!isThinking}
          disabled={isThinking}
          placeholder={`Chat with ${profile.name}...`}
          className='!max-h-[100px]'
        />
      </div>
    </AiInteractionDiv>
  );
};

export default ConversationWindow;

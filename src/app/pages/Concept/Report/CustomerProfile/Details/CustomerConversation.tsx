import React, { useMemo, useRef, useEffect, useCallback, forwardRef } from 'react';
import { cn } from '@libs/utils/react';
import { ICustomerProfile } from '@libs/api/types';
import Icon from '@components/Icon/Icon/Icon';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import FrostedLoadingCard from '@components/AiInteraction/FrostedLoadingCard';
import CustomerChatMessage from './CustomerChatMessage';
import useStore from '@stores/store';
import CustomerConversationSocketWrapper from '../CustomerConversationSocketWrapper';

interface CustomerConversationProps {
  profile: ICustomerProfile;
  className?: string;
  style?: React.CSSProperties;
}

const CustomerConversation = forwardRef<HTMLDivElement, CustomerConversationProps>(({
  profile,
  className = '',
  style = {},
}, ref) => {
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
    clearConversation();
  }, [profile, clearConversation]);

  // Derived state
  const isThinking = useMemo(() => {
    return messages.length > 0 && messages[messages.length - 1].role === 'user';
  }, [messages]);

  // Refs
  const conversationRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll handling
  const scrollToBottom = useCallback((delay = 300) => {
    setTimeout(() => {
      if (conversationRef.current) {
        const lastChild = conversationRef.current.lastElementChild;
        // eslint-disable-next-line no-console
        console.log({ lastChild });
        if (lastChild) {
          lastChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      scrollToBottom(1300); // Match the animation delay (1000ms) plus a little extra
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
    <div
      ref={ref || containerRef}
      className={cn(
        'aucctus-bg-primary aucctus-border-primary w-full rounded-lg border shadow-sm',
        'flex flex-col',
        className,
      )}
      style={style}
    >
      <CustomerConversationSocketWrapper />
      {/* Header */}
      <div className='flex flex-row gap-4 p-4'>
        <span className='flex items-center justify-center'>
          <Icon variant='message-circle' width={20} height={20} />
        </span>
        <span className='aucctus-text-primary aucctus-text-lg'>
          Chat with {profile.name.split(' ')[0]}
        </span>
        <span className='flex-1' />
        <button
          onClick={() => {}}
          className={cn(
            'aspect-square w-8 rounded-lg',
            'transition-all duration-200',
            'aucctus-bg-secondary-hover',
          )}
          aria-label='Close conversation'
        >
          <span className='flex items-center justify-center'>
            <Icon
              variant='closeX'
              width={20}
              height={20}
              className='aucctus-stroke-secondary'
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
        <span className='flex-1' />

        {/* Message history */}
        {messages.map((message) => (
          <div key={message.uuid} className='flex flex-row gap-4'>
            <CustomerChatMessage message={message} />
          </div>
        ))}
        {/* Loading indicator */}
        {isThinking && (
          <div
            style={{ animationDelay: `1000ms` }}
            className='mx-4 mb-4 flex animate-expand flex-row gap-4'
          >
            <FrostedLoadingCard variant='dark' className='h-fit' />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className='relative m-4 mt-auto w-auto'>
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
    </div>
  );
});

// Add display name for better debugging
CustomerConversation.displayName = 'CustomerConversation';

export default CustomerConversation;

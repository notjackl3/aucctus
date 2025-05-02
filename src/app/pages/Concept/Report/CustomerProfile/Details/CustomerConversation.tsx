import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@libs/utils/react';
import {
  ICustomerProfile,
  ICustomerProfileConversation,
} from '@libs/api/types';
import { IAssistantMessage } from '@stores/customer_profile_conversations/store';
import useStore from '@stores/store';
import { useModal } from '@context/ModalContextProvider';
import { useConceptCustomerProfileConversationMessages } from '@hooks/query/concepts.hook';

// Components
import { Icon, Modal } from '@components';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import FrostedLoadingCard from '@components/AiInteraction/FrostedLoadingCard';
import Tooltip from '@components/ToolTip/Tooltip';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import CustomerChatMessage from './CustomerChatMessage';
import CustomerConversationSocketWrapper from '../CustomerConversationSocketWrapper';
import SelectableCustomerConversationList from './SelectableCustomerConversationList';

// Types
interface CustomerConversationProps {
  profile: ICustomerProfile;
  conversations?: ICustomerProfileConversation[];
  className?: string;
  style?: React.CSSProperties;
}

const CustomerConversation = forwardRef<
  HTMLDivElement,
  CustomerConversationProps
>(({ profile, conversations, className = '', style = {} }, ref) => {
  // State
  const [activeConversation, setActiveConversation] = useState<
    ICustomerProfileConversation | undefined
  >(conversations?.[0]);

  useEffect(() => {
    setActiveConversation(conversations?.[0]);
  }, [conversations]);

  // Store hooks
  const {
    sendMessage,
    messages,
    currentMessage,
    setCurrentMessage,
    clearConversation,
    isAucctusTyping: isThinking,
    setConversation,
  } = useStore((state) => state.customerProfileConversations);

  // Context hooks
  const { openModal, closeModal } = useModal();

  // Query hooks
  const {
    data: conversationMessages,
    isLoading: isLoadingConversationMessages,
    refetch: refetchConversationMessages,
  } = useConceptCustomerProfileConversationMessages(
    profile.uuid,
    activeConversation?.uuid,
    false,
  );

  // Refs
  const conversationRef = useRef<HTMLDivElement>(null);

  // Memoized values
  const introMessage: IAssistantMessage = useMemo(() => {
    return {
      role: 'assistant',
      content: `Hi there! I'm ${profile.name}. Feel free to ask me anything about my preferences, habits, or needs as a potential customer.`,
      uuid: uuidv4(),
      timestamp: new Date().toISOString(),
      name: profile.name,
    };
  }, [profile]);

  // Callbacks
  const scrollToBottom = useCallback((delay = 300) => {
    setTimeout(() => {
      if (conversationRef.current) {
        const lastChild = conversationRef.current.lastElementChild;
        if (lastChild) {
          lastChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          conversationRef.current.scrollTop =
            conversationRef.current.scrollHeight;
        }
      }
    }, delay);
  }, []);

  const handleSelectConversation = useCallback(
    (conversation: ICustomerProfileConversation) => {
      setActiveConversation(conversation);
    },
    [],
  );

  const handleSubmitMessage = async () => {
    await sendMessage();
  };

  const handleMessageChange = (value: string) => {
    setCurrentMessage(value);
  };

  const handleSearchConversation = () => {
    openModal(Modal.CustomerConversationSearch, {
      customerProfileUuid: profile.uuid,
      onSelectConversation: (conversation: ICustomerProfileConversation) => {
        setActiveConversation(conversation);
        closeModal();
      },
    });
  };

  // Effects
  useEffect(() => {
    if (conversationMessages && activeConversation) {
      const fullConversation = (conversations ?? []).find(
        (c) => c.uuid === activeConversation.uuid,
      );

      if (fullConversation) {
        fullConversation.messages = conversationMessages;
        setConversation(fullConversation);
      }
    }
  }, [
    conversationMessages,
    conversations,
    activeConversation,
    setConversation,
  ]);

  useEffect(() => {
    clearConversation();
    setActiveConversation(undefined);
  }, [profile, clearConversation]);

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

  useEffect(() => {
    if (isThinking) {
      scrollToBottom(1300); // Match the animation delay (1000ms) plus a little extra
    } else {
      scrollToBottom();
    }
  }, [messages, isThinking, scrollToBottom]);

  // Add an effect to manually trigger the fetch only when profile changes
  useEffect(() => {
    if (profile.uuid && activeConversation?.uuid) {
      refetchConversationMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchConversationMessages, activeConversation]);

  return (
    <div
      ref={ref}
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
        <span className='mr-2 flex flex-row gap-2'>
          <Tooltip tip='Search for a conversation'>
            <button
              onClick={handleSearchConversation}
              className={cn(
                'aspect-square w-8 rounded-lg',
                'transition-all duration-200',
                'aucctus-bg-secondary-hover',
              )}
              aria-label='Search conversation'
            >
              <span className='flex items-center justify-center'>
                <Icon
                  variant='search-md'
                  width={20}
                  height={20}
                  className='aucctus-stroke-secondary'
                />
              </span>
            </button>
          </Tooltip>
          <Tooltip tip='Start a new conversation'>
            <button
              onClick={() => clearConversation()}
              className={cn(
                'aspect-square w-8 rounded-lg',
                'transition-all duration-200',
                'aucctus-bg-secondary-hover',
              )}
              aria-label='Start new conversation'
            >
              <span className='flex items-center justify-center'>
                <Icon
                  variant='edit'
                  width={20}
                  height={20}
                  className='aucctus-stroke-secondary'
                />
              </span>
            </button>
          </Tooltip>
        </span>
      </div>

      {/* Conversation area */}
      <div className='mb-2 flex flex-1 flex-row gap-4 overflow-hidden px-4'>
        <div
          ref={conversationRef}
          className='no-scrollbar flex flex-1 flex-col scroll-smooth'
          aria-live='polite'
        >
          <span className='flex-1' />

          <div key={introMessage.uuid} className='flex flex-row gap-4'>
            <CustomerChatMessage profile={profile} message={introMessage} />
          </div>

          {/* Message history */}
          {!isLoadingConversationMessages &&
            messages.map((message) => (
              <div key={message.uuid} className='flex flex-row gap-4'>
                <CustomerChatMessage profile={profile} message={message} />
              </div>
            ))}

          {/* Loading indicator */}
          {isThinking && (
            <div
              style={{ animationDelay: `1000ms` }}
              className='mx-4 mb-4 flex animate-expand flex-row gap-4'
            >
              <FrostedLoadingCard className='h-fit' />
            </div>
          )}
        </div>

        {/* Conversation list sidebar */}
        <div className='aucctus-border-primary flex min-w-[100px] max-w-[100px] flex-col gap-4 border-l p-1'>
          <SelectableCustomerConversationList
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
          />
        </div>
      </div>

      {/* Message input */}
      <div className='relative m-4 mt-auto w-auto'>
        <AucctusMessageInput
          value={currentMessage ?? ''}
          onChange={(e) => handleMessageChange(e.target.value)}
          onSubmitMessage={handleSubmitMessage}
          allowSubmitMessage={!isThinking}
          disabled={isThinking}
          placeholder={`Ask ${profile.name} a question...`}
          className='!max-h-[100px]'
        />
        <div className='aucctus-text-tertiary aucctus-text-sm mt-2 flex flex-row items-center justify-center gap-2'>
          <span className='flex items-center justify-center'>
            <Icon
              variant='alert-circle'
              className='aucctus-stroke-quaternary'
              width={16}
              height={16}
            />
          </span>
          <span>
            This chat is synthetic and may provide inaccurate information
          </span>
        </div>
      </div>

      <LoadingMask isLoading={isLoadingConversationMessages} />
    </div>
  );
});

// Add display name for better debugging
CustomerConversation.displayName = 'CustomerConversation';

export default CustomerConversation;

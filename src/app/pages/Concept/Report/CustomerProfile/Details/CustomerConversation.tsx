import { useModal } from '@context/ModalContextProvider';
import { useConceptCustomerProfileConversationMessages } from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import api from '@libs/api';
import { downloadPdf } from '@libs/utils/files';
import { cn } from '@libs/utils/react';
import {
  CustomerProfileMessage,
  IAssistantMessage,
  ICustomerProfileConversation,
} from '@stores/customer_profile_conversations/store';
import useStore from '@stores/store';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

// Components
import { Loading, Modal, toast } from '@components';
import defaultAvatar from '@assets/img/avatar.png';
import Avatar from '@components/Avatar';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import CustomerConversationSocketWrapper from '../CustomerConversationSocketWrapper';
import CustomerChatMessage from './CustomerChatMessage';
import SelectableCustomerConversationList from './SelectableCustomerConversationList';
import {
  AlertCircle,
  Download,
  MessageCircle,
  Pencil,
  Search,
} from 'lucide-react';

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
  // Refs
  const conversationRef = useRef<HTMLDivElement>(null);
  const conversationMessagesRef = useRef<ICustomerProfileConversation[]>([]);

  // State
  const [activeConversation, setActiveConversation] = useState<
    ICustomerProfileConversation | undefined
  >(undefined);

  const [activeMessages, setActiveMessages] = useState<
    CustomerProfileMessage[]
  >([]);

  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Context hooks
  const { openModal, closeModal } = useModal();

  // Store hooks
  const storeSessionId = useStore(
    (state) => state.customerProfileConversations.sessionId,
  );
  const {
    sendMessage,
    currentMessage,
    setCurrentMessage,
    clearConversation,
    isAucctusTyping: isThinking,
    setConversation,
  } = useStore((state) => state.customerProfileConversations);

  const messages = useStore(
    (state) => state.customerProfileConversations.messages,
  );

  const shouldFetchMessages = useMemo(() => {
    if (!activeConversation?.uuid || isThinking) return false;

    // Don't fetch if we already have messages in the store for this conversation
    if (messages.length > 0) return false;

    return (
      conversations?.some((c) => c.uuid === activeConversation.uuid) ?? false
    );
  }, [activeConversation?.uuid, conversations, isThinking, messages.length]);

  // Query hooks
  const {
    data: conversationMessages = { results: [] },
    isLoading: isLoadingConversationMessages,
    refetch: refetchConversationMessages,
  } = useConceptCustomerProfileConversationMessages(
    profile.uuid,
    activeConversation?.uuid,
    shouldFetchMessages,
  );

  React.useEffect(() => {
    setActiveMessages(messages);
  }, [messages]);

  // Loading messages for first interaction
  const loadingMessages = useMemo(() => {
    const firstName = profile.name.split(' ')[0];
    return [
      `Bringing ${firstName} into the room...`,
      `Offering ${firstName} coffee...`,
      `Making sure ${firstName}'s phone is set to silent...`,
      `${firstName} is reviewing your question...`,
      `Getting ${firstName} comfortable...`,
      `${firstName} is gathering their thoughts...`,
    ];
  }, [profile.name]);

  // Memoized values
  const introMessage: IAssistantMessage = useMemo(() => {
    return {
      role: 'assistant',
      content: `Hi there! I'm ${profile.name}. Feel free to ask me anything about my preferences, habits, or needs as a potential customer.`,
      uuid: uuidv4(),
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      name: profile.name,
    };
  }, [profile]);

  const canExport = useMemo(() => {
    const sessionId = activeConversation?.uuid || storeSessionId;
    return !!sessionId && activeMessages.length > 0;
  }, [activeConversation?.uuid, activeMessages.length, storeSessionId]);

  // Callbacks
  const doConversationClear = useCallback(() => {
    conversationMessagesRef.current = [];
    clearConversation();
    setActiveConversation(undefined);
    setIsFirstMessage(true);
    setLoadingMessageIndex(0);
  }, [clearConversation, setActiveConversation]);

  const scrollToBottom = useCallback((delay = 300) => {
    setTimeout(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop =
          conversationRef.current.scrollHeight;
      }
    }, delay);
  }, []);

  const handleSelectConversation = useCallback(
    (conversation: ICustomerProfileConversation) => {
      if (conversation.uuid === activeConversation?.uuid) return;
      clearConversation();
      conversationMessagesRef.current = [];
      setActiveConversation(conversation);
    },
    [clearConversation, activeConversation?.uuid],
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

  const handleExportConversation = useCallback(async () => {
    const sessionId = activeConversation?.uuid || storeSessionId;

    if (!sessionId) {
      toast.error(
        'No conversation found',
        'Start a conversation before exporting.',
      );
      return;
    }

    if (activeMessages.length === 0) {
      toast.error('No messages', 'Send a message to export this chat.');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await api.concept.exportConceptCustomerProfileConversation(
        profile.uuid,
        sessionId,
      );
      const safeName =
        profile.name.replace(/[^a-z0-9]/gi, '_') || 'customer_profile';
      await downloadPdf(blob, `${safeName}_chat.pdf`);
    } catch (error) {
      toast.error(
        'Export failed',
        'Unable to export this conversation right now. Please try again.',
      );
    } finally {
      setIsExporting(false);
    }
  }, [
    activeConversation?.uuid,
    activeMessages.length,
    profile.name,
    profile.uuid,
    storeSessionId,
  ]);

  // Effects - Initialization
  // Auto-select a newly created conversation (when user sends the first message
  // and a new session ID appears), but don't auto-select on page load/navigation.
  useEffect(() => {
    if (storeSessionId && !activeConversation) {
      const match = conversations?.find((c) => c.uuid === storeSessionId);
      if (match) {
        setActiveConversation(match);
      }
    }
  }, [storeSessionId, activeConversation, conversations]);

  useEffect(() => {
    doConversationClear();
  }, [profile, doConversationClear]);

  // Effect - Rotate loading messages when thinking and it's the first message
  useEffect(() => {
    if (!isThinking || !isFirstMessage) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isThinking, isFirstMessage, loadingMessages.length]);

  // Effect - Mark first message as complete when we get a response AND we're not thinking
  useEffect(() => {
    if (activeMessages.length > 0 && isFirstMessage && !isThinking) {
      setIsFirstMessage(false);
    }
  }, [activeMessages.length, isFirstMessage, isThinking]);

  // Effects - Data synchronization
  useEffect(() => {
    if (conversationMessages && activeConversation) {
      const fullConversation = (conversations ?? []).find(
        (c) => c.uuid === activeConversation.uuid,
      );

      if (
        JSON.stringify(conversationMessagesRef.current) ===
        JSON.stringify(conversationMessages.results)
      ) {
        return;
      }

      conversationMessagesRef.current = conversationMessages.results;

      if (fullConversation) {
        fullConversation.messages = conversationMessages.results;
        setConversation(fullConversation);
        // Stupid workaround to circumvent issues with Zustand not pushing a state update immediately after a page refresh.
        setActiveMessages(conversationMessages.results);
      }
    }
    // ignore conversations to prevent conversation refresh on new conversation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessages, activeConversation, setConversation]);

  useEffect(() => {
    if (profile.uuid && activeConversation?.uuid && shouldFetchMessages) {
      refetchConversationMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchConversationMessages, activeConversation, shouldFetchMessages]);

  // Effects - UI Updates
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

  return (
    <div
      ref={ref}
      className={cn('flex h-full w-full flex-col overflow-hidden', className)}
      style={style}
    >
      <CustomerConversationSocketWrapper />

      {/* Header */}
      <div className='flex flex-row gap-4 p-4'>
        <span className='flex items-center justify-center'>
          <MessageCircle size={20} />
        </span>
        <span className='aucctus-text-primary aucctus-text-lg'>
          Chat with{' '}
          {profile.name.split(' ').length > 1
            ? profile.name.split(' ').slice(0, -1).join(' ')
            : profile.name}
        </span>
        <span className='flex-1' />
        <span className='mr-2 flex flex-row gap-2'>
          <ComponentTooltip
            tip={
              <div className='aucctus-text-primary aucctus-text-sm aucctus-bg-primary rounded-lg px-3 py-1.5 shadow-md'>
                Search for a conversation
              </div>
            }
          >
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
                <Search size={20} className='aucctus-stroke-secondary' />
              </span>
            </button>
          </ComponentTooltip>
          <ComponentTooltip
            tip={
              <div className='aucctus-text-primary aucctus-text-sm aucctus-bg-primary rounded-lg px-3 py-1.5 shadow-md'>
                Export chat as PDF
              </div>
            }
          >
            <button
              onClick={handleExportConversation}
              disabled={!canExport || isExporting}
              className={cn(
                'aspect-square w-8 rounded-lg',
                'transition-all duration-200',
                'aucctus-bg-secondary-hover',
                (!canExport || isExporting) && 'cursor-not-allowed opacity-50',
              )}
              aria-label='Export conversation'
            >
              <span className='flex items-center justify-center'>
                {isExporting ? (
                  <Loading isSmall />
                ) : (
                  <Download size={20} className='aucctus-stroke-secondary' />
                )}
              </span>
            </button>
          </ComponentTooltip>
          <ComponentTooltip
            tip={
              <div className='aucctus-text-primary aucctus-text-sm aucctus-bg-primary rounded-lg px-3 py-1.5 shadow-md'>
                Start a new conversation
              </div>
            }
          >
            <button
              onClick={doConversationClear}
              className={cn(
                'aspect-square w-8 rounded-lg',
                'transition-all duration-200',
                'aucctus-bg-secondary-hover',
              )}
              aria-label='Start new conversation'
            >
              <span className='flex items-center justify-center'>
                <Pencil size={20} className='aucctus-stroke-secondary' />
              </span>
            </button>
          </ComponentTooltip>
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

          {/* Empty state with avatar */}
          {activeMessages.length === 0 && !isThinking && (
            <div className='mb-8 flex flex-col items-center justify-center space-y-6 py-16'>
              <Avatar
                firstName={profile.name}
                lastName=''
                src={profile?.avatarUrl || defaultAvatar}
                className={cn(
                  'aucctus-border-primary h-24 w-24 rounded-full border-2 shadow-md',
                )}
              />
              <div className='aucctus-bg-secondary aucctus-border-secondary rounded-full border px-6 py-2.5 shadow-sm backdrop-blur-sm'>
                <p className='aucctus-text-secondary aucctus-text-sm'>
                  Ask me anything you want to know!
                </p>
              </div>
            </div>
          )}

          {/* Initial greeting - only show if we have messages */}
          {activeMessages.length > 0 && (
            <div key={introMessage.uuid} className='flex flex-row gap-4'>
              <CustomerChatMessage profile={profile} message={introMessage} />
            </div>
          )}

          {/* Message history */}
          {!isLoadingConversationMessages &&
            activeMessages.map((message, index) => (
              <div
                key={message.role + message.content + index}
                className='flex flex-row gap-4'
              >
                <CustomerChatMessage profile={profile} message={message} />
              </div>
            ))}

          {/* Loading indicator */}
          {isThinking && (
            <div className='flex animate-expand flex-row'>
              <Avatar
                firstName={profile.name}
                lastName=''
                src={profile?.avatarUrl || defaultAvatar}
                className={cn(
                  'aucctus-border-primary h-6 w-6 rounded-full border transition-all duration-300',
                )}
              />
              <div className='aucctus-bg-secondary ml-4 h-fit max-w-[70%] space-y-2 rounded-lg p-4'>
                {isFirstMessage ? (
                  <div className='flex items-center gap-3'>
                    <div className='flex gap-1'>
                      <Loading isSmall />
                    </div>
                    <span className='aucctus-text-secondary aucctus-text-sm animate-pulse'>
                      {loadingMessages[loadingMessageIndex] || 'Thinking...'}
                    </span>
                  </div>
                ) : (
                  <div className='flex gap-1'>
                    <Loading isSmall />
                  </div>
                )}
              </div>
              <div className='flex flex-1' />
            </div>
          )}
        </div>

        {/* Conversation list sidebar */}
        <div className='aucctus-border-primary flex min-w-[100px] max-w-[100px] flex-col gap-4 border-l p-1'>
          <SelectableCustomerConversationList
            conversations={conversations}
            activeConversation={activeConversation}
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
            <AlertCircle size={16} className='aucctus-stroke-quaternary' />
          </span>
          <span>
            This chat is synthetic and may provide inaccurate information
          </span>
        </div>
      </div>

      {/* Don't show LoadingMask when we're already in thinking state (waiting for AI response) */}
      <LoadingMask isLoading={isLoadingConversationMessages && !isThinking} />
    </div>
  );
});

// Add display name for better debugging
CustomerConversation.displayName = 'CustomerConversation';

export default CustomerConversation;

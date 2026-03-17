/**
 * PersonaLiveChat - Live chat interface for persona conversations
 *
 * Allows users to have real-time conversations with personas.
 * Features:
 * - Starter prompt cards (suggested questions)
 * - Chat message list with user/assistant bubbles
 * - Input field with send button
 * - @mention support for tagging concepts/personas
 * - Streaming response display
 * - Chat session persistence
 * - Searchable past conversations
 * - Conversation export as PDF
 * - New conversation + session sidebar
 */

import { Loading, Modal, toast } from '@components';
import Avatar from '@components/Avatar';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import AucctusMessageInput from '@components/Input/AucctusMessageInput';
import PersonaChatInput, {
  type PersonaChatInputHandle,
} from './PersonaChatInput';
import { useModal } from '@context/ModalContextProvider';
import { useChatSessions, useMentionSearch } from '@hooks/query/persona.hook';
import api from '@libs/api';
import type {
  IChatSession,
  IPersonaConversationSearchResult,
} from '@libs/api/types/persona';
import { downloadPdf } from '@libs/utils/files';
import { cn } from '@libs/utils/react';
import {
  AlertCircle,
  Download,
  MessageCircle,
  Pencil,
  Search,
} from 'lucide-react';
import type { PersonaConversationMessage } from '@stores/persona-conversations/store';
import useStore from '@stores/store';

import type { IOutboundMention } from '@libs/api/types/socketMessages/outbound';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import PersonaChatSocketWrapper from './PersonaChatSocketWrapper';
import PersonaConversationSidebar from './PersonaConversationSidebar';
import PersonaThinkingSteps from './PersonaThinkingSteps';

/** Chat message type */
export type MessageRole = 'user' | 'assistant';

/** Chat message structure (for display) */
export interface ChatMessage {
  uuid: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

/** Props for the PersonaLiveChat component */
export interface PersonaLiveChatProps {
  /** Persona UUID for API calls */
  personaUuid: string;
  /** Persona name for display */
  personaName: string;
  /** Persona avatar URL */
  personaAvatarUrl?: string;
  /** Representative name */
  representativeName?: string;
  /** Additional CSS classes */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Hide @mention UI and use simple input instead */
  disableMentions?: boolean;
  /** Concept UUID to contextualize the chat to a specific concept */
  conceptUuid?: string;
}

/**
 * Renders message content with @mentions styled as inline spans.
 */
const renderContentWithMentions = (content: string): React.ReactNode => {
  const mentionRegex = /@(?:"([^"]+)"|(\S+))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const mentionName = match[1] || match[2];
    parts.push(
      <span
        key={`mention-${match.index}`}
        className='aucctus-text-brand-primary font-medium'
      >
        @{mentionName}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
};

/**
 * Chat Bubble Component - Renders individual chat messages
 */
interface ChatBubbleProps {
  message: ChatMessage;
  personaName: string;
  personaAvatarUrl?: string;
  hideMentions?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = React.memo(function ChatBubble({
  message,
  personaName,
  personaAvatarUrl,
  hideMentions = false,
}: ChatBubbleProps) {
  const { user } = useStore((state) => state.auth);
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className='mb-2 flex flex-1 animate-expand flex-row'>
        <div className='flex flex-1' />
        <div className='aucctus-text-primary aucctus-bg-quaternary mr-4 h-fit max-w-[70%] rounded-lg p-4'>
          {hideMentions
            ? message.content
            : renderContentWithMentions(message.content)}
        </div>
        <Avatar
          firstName={user?.firstName || ''}
          lastName={user?.lastName || ''}
          src={user?.profileImage}
          className='aucctus-border-primary h-6 w-6 rounded-full border transition-all duration-300'
        />
      </div>
    );
  }

  return (
    <div className='mb-2 flex flex-1 animate-expand flex-row'>
      <Avatar
        firstName={personaName}
        lastName=''
        src={personaAvatarUrl}
        className='aucctus-border-primary h-6 w-6 rounded-full border transition-all duration-300'
      />
      <div className='aucctus-text-primary aucctus-bg-secondary ml-4 h-fit max-w-[70%] space-y-2 rounded-lg p-4'>
        <p className='whitespace-pre-wrap'>
          {hideMentions
            ? message.content
            : renderContentWithMentions(message.content)}
        </p>
        {/* Streaming indicator */}
        {message.isStreaming && (
          <span className='aucctus-bg-tertiary ml-1 inline-block h-4 w-1.5 animate-pulse rounded-full' />
        )}
      </div>
      <div className='flex flex-1' />
    </div>
  );
});

/**
 * Maps store message to display ChatMessage format
 */
const mapToDisplayMessage = (msg: PersonaConversationMessage): ChatMessage => ({
  uuid: msg.uuid,
  role: msg.role === 'error' ? 'assistant' : msg.role,
  content: msg.content,
  timestamp: msg.timestamp || new Date().toISOString(),
});

/**
 * PersonaLiveChat Component
 */
const PersonaLiveChat = forwardRef<HTMLDivElement, PersonaLiveChatProps>(
  (
    {
      personaUuid,
      personaName,
      personaAvatarUrl,
      className,
      style = {},
      disableMentions = false,
      conceptUuid,
    },
    ref,
  ) => {
    // Refs
    const conversationRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<PersonaChatInputHandle>(null);

    // State
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [isExporting, setIsExporting] = useState(false);

    // Local message state to prevent race conditions between user messages and streaming responses.
    // This mirrors the pattern from CustomerConversation.tsx - the useEffect sync provides a buffer
    // that ensures messages are displayed in the correct order.
    const [activeMessages, setActiveMessages] = useState<
      PersonaConversationMessage[]
    >([]);

    // @mention state - now driven by PersonaChatInput (skipped when disableMentions)
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const showMentionDropdown = !disableMentions && mentionQuery !== null;

    // Simple input state for disableMentions mode
    const [simpleInputValue, setSimpleInputValue] = useState('');

    // Modal
    const { openModal, closeModal } = useModal();

    // Zustand store
    const storeMessages = useStore(
      (state) => state.personaConversations.messages,
    );
    const isPersonaTyping = useStore(
      (state) => state.personaConversations.isPersonaTyping,
    );
    const toolActivitySteps = useStore(
      (state) => state.personaConversations.toolActivitySteps,
    );
    const currentStreamingContent = useStore(
      (state) => state.personaConversations.currentStreamingContent,
    );
    const currentStreamingUuid = useStore(
      (state) => state.personaConversations.currentStreamingUuid,
    );
    const sessionId = useStore((state) => state.personaConversations.sessionId);
    const setCurrentMessage = useStore(
      (state) => state.personaConversations.setCurrentMessage,
    );
    const storeSendMessage = useStore(
      (state) => state.personaConversations.sendMessage,
    );
    const setPersonaUuid = useStore(
      (state) => state.personaConversations.setPersonaUuid,
    );
    const setConceptUuid = useStore(
      (state) => state.personaConversations.setConceptUuid,
    );
    const setConversation = useStore(
      (state) => state.personaConversations.setConversation,
    );
    const clearConversation = useStore(
      (state) => state.personaConversations.clearConversation,
    );

    // REST hooks (still HTTP for listing/mentions)
    const { sessions, isLoading: isLoadingConversations } =
      useChatSessions(personaUuid);
    const { results: mentionResults, isSearching: isMentionSearching } =
      useMentionSearch(
        disableMentions ? null : mentionQuery,
        undefined,
        personaUuid,
      );

    // Loading messages for first interaction
    const loadingMessages = useMemo(() => {
      const firstName = personaName.split(' ')[0];
      return [
        `Bringing ${firstName} into the room...`,
        `Offering ${firstName} coffee...`,
        `Making sure ${firstName}'s phone is set to silent...`,
        `${firstName} is reviewing your question...`,
        `Getting ${firstName} comfortable...`,
        `${firstName} is gathering their thoughts...`,
      ];
    }, [personaName]);

    // Intro message for the persona
    const introMessage: ChatMessage = useMemo(() => {
      return {
        uuid: uuidv4(),
        role: 'assistant',
        content: `Hi there! I'm ${personaName}. Feel free to ask me anything about my preferences, habits, or needs as a potential customer.`,
        timestamp: new Date().toISOString(),
      };
    }, [personaName]);

    // Sync store messages to local state. This creates a buffer that prevents race conditions
    // where streaming content arrives before React has re-rendered with the user message.
    // Pattern copied from CustomerConversation.tsx.
    useEffect(() => {
      setActiveMessages(storeMessages);
    }, [storeMessages]);

    // Map store messages to display format, including streaming message
    const displayMessages: ChatMessage[] = useMemo(() => {
      const mapped = activeMessages.map(mapToDisplayMessage);

      // Only add streaming message if there's at least one user message already rendered.
      // This prevents a race condition where the streaming response appears before
      // the user message that triggered it (WebSocket can respond faster than React re-renders).
      const hasUserMessage = mapped.some((m) => m.role === 'user');

      if (currentStreamingContent && currentStreamingUuid && hasUserMessage) {
        const existingIndex = mapped.findIndex(
          (m) => m.uuid === currentStreamingUuid,
        );
        const streamingMessage: ChatMessage = {
          uuid: currentStreamingUuid,
          role: 'assistant',
          content: currentStreamingContent,
          timestamp: new Date().toISOString(),
          isStreaming: true,
        };

        if (existingIndex !== -1) {
          mapped[existingIndex] = streamingMessage;
        } else {
          mapped.push(streamingMessage);
        }
      }

      return mapped;
    }, [activeMessages, currentStreamingContent, currentStreamingUuid]);

    const isThinking = isPersonaTyping;
    const hasMessages = displayMessages.length > 0;
    const canExport = !!sessionId && hasMessages;

    // Callbacks
    const doConversationClear = useCallback(() => {
      clearConversation(true);
      setIsFirstMessage(true);
      setLoadingMessageIndex(0);
    }, [clearConversation]);

    const scrollToBottom = useCallback((delay = 300) => {
      setTimeout(() => {
        if (conversationRef.current) {
          conversationRef.current.scrollTop =
            conversationRef.current.scrollHeight;
        }
      }, delay);
    }, []);

    // Set personaUuid and conceptUuid in store on mount
    useEffect(() => {
      setPersonaUuid(personaUuid);
      setConceptUuid(conceptUuid);
      return () => {
        clearConversation(true);
        setConceptUuid(undefined);
      };
    }, [
      personaUuid,
      conceptUuid,
      setPersonaUuid,
      setConceptUuid,
      clearConversation,
    ]);

    // Resume most recent session on mount (load history)
    useEffect(() => {
      if (
        sessions.length > 0 &&
        !useStore.getState().personaConversations.sessionId
      ) {
        setConversation({
          uuid: sessions[0].uuid,
          createdAt: sessions[0].startedAt,
        });
      }
    }, [sessions, setConversation]);

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
      if (displayMessages.length > 0 && isFirstMessage && !isThinking) {
        setIsFirstMessage(false);
      }
    }, [displayMessages.length, isFirstMessage, isThinking]);

    // Effects - UI Updates: MutationObserver for auto-scroll
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
    }, [activeMessages, isThinking, scrollToBottom]);

    // Handle sending a message from the PersonaChatInput
    const handleSend = useCallback(
      (text: string, mentions: IOutboundMention[]) => {
        if (!text.trim() || isThinking) return;

        // Set the message text in store so sendMessage can pick it up
        setCurrentMessage(text);

        // Use setTimeout to ensure state is set before sending
        setTimeout(() => {
          storeSendMessage(mentions.length > 0 ? mentions : undefined);
          // Focus back on input
          inputRef.current?.focus();
        }, 0);
      },
      [isThinking, setCurrentMessage, storeSendMessage],
    );

    // Handle sending from simple input (disableMentions mode)
    const handleSimpleSend = useCallback(() => {
      if (!simpleInputValue.trim() || isThinking) return;
      handleSend(simpleInputValue, []);
      setSimpleInputValue('');
    }, [simpleInputValue, isThinking, handleSend]);

    // Handle selecting a session from sidebar
    const handleSelectSession = useCallback(
      async (session: IChatSession) => {
        try {
          const detail = await api.persona.getChatSession(
            personaUuid,
            session.uuid,
          );
          setConversation({
            uuid: detail.uuid,
            createdAt: detail.startedAt,
            messages: detail.messages.map((m) => ({
              uuid: m.uuid,
              content: m.content,
              role: m.role as 'user' | 'assistant',
              timestamp: m.createdAt,
              createdAt: m.createdAt,
              name: m.role === 'assistant' ? personaName : undefined,
            })),
          });
        } catch {
          toast.error('Load Failed', 'Unable to load conversation.');
        }
      },
      [personaUuid, personaName, setConversation],
    );

    // Handle search conversation
    const handleSearchConversation = useCallback(() => {
      openModal(Modal.PersonaConversationSearch, {
        personaUuid,
        onSelectConversation: async (
          result: IPersonaConversationSearchResult,
        ) => {
          closeModal();
          try {
            const detail = await api.persona.getChatSession(
              personaUuid,
              result.sessionId,
            );
            setConversation({
              uuid: detail.uuid,
              createdAt: detail.startedAt,
              messages: detail.messages.map((m) => ({
                uuid: m.uuid,
                content: m.content,
                role: m.role as 'user' | 'assistant',
                timestamp: m.createdAt,
                createdAt: m.createdAt,
                name: m.role === 'assistant' ? personaName : undefined,
              })),
            });
          } catch {
            toast.error('Load Failed', 'Unable to load conversation.');
          }
        },
      });
    }, [openModal, closeModal, personaUuid, personaName, setConversation]);

    // Handle export conversation as PDF
    const handleExportConversation = useCallback(async () => {
      if (!sessionId) {
        toast.error(
          'No conversation found',
          'Start a conversation before exporting.',
        );
        return;
      }

      if (!hasMessages) {
        toast.error('No messages', 'Send a message to export this chat.');
        return;
      }

      setIsExporting(true);
      try {
        const blob = await api.persona.exportConversationPdf(
          personaUuid,
          sessionId,
        );
        const safeName = personaName.replace(/[^a-z0-9]/gi, '_') || 'persona';
        await downloadPdf(blob, `${safeName}_chat.pdf`);
      } catch {
        toast.error(
          'Export failed',
          'Unable to export this conversation right now. Please try again.',
        );
      } finally {
        setIsExporting(false);
      }
    }, [sessionId, hasMessages, personaUuid, personaName]);

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
        <PersonaChatSocketWrapper />

        {/* Header */}
        <div className='flex flex-row gap-4 p-4'>
          <span className='flex items-center justify-center'>
            <MessageCircle size={20} />
          </span>
          <span className='aucctus-text-primary aucctus-text-lg'>
            Chat with{' '}
            {personaName.split(' ').length > 1
              ? personaName.split(' ').slice(0, -1).join(' ')
              : personaName}
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
                  (!canExport || isExporting) &&
                    'cursor-not-allowed opacity-50',
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
            {!hasMessages && !isThinking && (
              <div className='mb-8 flex flex-col items-center justify-center space-y-6 py-16'>
                <Avatar
                  firstName={personaName}
                  lastName=''
                  src={personaAvatarUrl}
                  className='aucctus-border-primary h-24 w-24 rounded-full border-2 shadow-md'
                />
                <div className='aucctus-bg-secondary aucctus-border-secondary rounded-full border px-6 py-2.5 shadow-sm backdrop-blur-sm'>
                  <p className='aucctus-text-secondary aucctus-text-sm'>
                    Ask me anything you want to know!
                  </p>
                </div>
              </div>
            )}

            {/* Initial greeting - only show if we have messages */}
            {hasMessages && (
              <div className='flex flex-row gap-4'>
                <ChatBubble
                  message={introMessage}
                  personaName={personaName}
                  personaAvatarUrl={personaAvatarUrl}
                  hideMentions={disableMentions}
                />
              </div>
            )}

            {/* Message history */}
            {displayMessages.map((message) => (
              <div key={message.uuid} className='flex flex-row gap-4'>
                <ChatBubble
                  message={message}
                  personaName={personaName}
                  personaAvatarUrl={personaAvatarUrl}
                  hideMentions={disableMentions}
                />
              </div>
            ))}

            {/* Loading indicator - only show after user message is rendered */}
            {isThinking && !currentStreamingContent && hasMessages && (
              <div className='flex animate-expand flex-row'>
                <Avatar
                  firstName={personaName}
                  lastName=''
                  src={personaAvatarUrl}
                  className='aucctus-border-primary h-6 w-6 rounded-full border transition-all duration-300'
                />
                <div className='aucctus-bg-secondary ml-4 h-fit max-w-[70%] space-y-2 rounded-lg p-4'>
                  {toolActivitySteps.length > 0 ? (
                    <PersonaThinkingSteps steps={toolActivitySteps} />
                  ) : isFirstMessage ? (
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
          {sessions.length > 0 && (
            <PersonaConversationSidebar
              sessions={sessions}
              activeSessionUuid={sessionId}
              onSelectSession={handleSelectSession}
              className='min-w-[100px] max-w-[140px] p-1'
            />
          )}
        </div>

        {/* Message input */}
        <div className='relative m-4 mt-auto w-auto'>
          {disableMentions ? (
            <AucctusMessageInput
              value={simpleInputValue}
              onChange={(e) => setSimpleInputValue(e.target.value)}
              onSubmitMessage={handleSimpleSend}
              allowSubmitMessage={!isThinking}
              disabled={isThinking}
              placeholder={`Ask ${personaName} a question...`}
              className='!max-h-[100px]'
            />
          ) : (
            <PersonaChatInput
              ref={inputRef}
              onSubmit={handleSend}
              disabled={isThinking}
              placeholder={`Ask ${personaName} a question...`}
              showMentionDropdown={showMentionDropdown}
              onMentionQueryChange={setMentionQuery}
              mentionResults={mentionResults}
              isMentionSearching={isMentionSearching}
            />
          )}
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
        <LoadingMask isLoading={isLoadingConversations && !isThinking} />
      </div>
    );
  },
);

// Add display name for better debugging
PersonaLiveChat.displayName = 'PersonaLiveChat';

/**
 * Error boundary wrapper for PersonaLiveChat.
 * Catches render errors and displays a fallback UI instead of crashing the page.
 */
interface ChatErrorBoundaryState {
  hasError: boolean;
}

class PersonaLiveChatErrorBoundary extends React.Component<
  PersonaLiveChatProps,
  ChatErrorBoundaryState
> {
  constructor(props: PersonaLiveChatProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChatErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error('PersonaLiveChat error boundary caught:', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className={cn(
            'aucctus-bg-primary aucctus-border-primary flex flex-col items-center justify-center gap-3 rounded-lg border p-6 shadow-sm',
            this.props.className,
          )}
          style={this.props.style}
        >
          <AlertCircle className='aucctus-text-quaternary h-8 w-8' />
          <p className='aucctus-text-sm aucctus-text-secondary text-center'>
            Chat encountered an error.
          </p>
          <button
            type='button'
            className='btn btn-secondary btn-sm'
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return <PersonaLiveChat {...this.props} />;
  }
}

export default PersonaLiveChatErrorBoundary;

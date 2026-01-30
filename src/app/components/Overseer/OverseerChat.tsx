import { IAiEditingSuggestion } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { OverseerMessage } from '@stores/overseer/store';
import { IOverseerEditSuggestions } from '@stores/overseer/types';
import React, { useEffect, useRef } from 'react';
import OverseerChatMessage from './OverseerChatMessage';
import OverseerEditSuggestions from './OverseerEditSuggestions';
import OverseerThinkingIndicator from './OverseerThinkingIndicator';

interface OverseerChatProps {
  messages: OverseerMessage[];
  isThinking: boolean;
  thinkingMessage?: string;
  className?: string;
  editSuggestions?: IOverseerEditSuggestions | null;
  onConfirmEdits?: (selectedEdits: IAiEditingSuggestion[]) => void;
  onCancelEdits?: () => void;
}

/**
 * Chat messages area for Overseer
 * Displays conversation history with auto-scroll to bottom
 */
const OverseerChat: React.FC<OverseerChatProps> = ({
  messages,
  isThinking,
  thinkingMessage,
  className,
  editSuggestions,
  onConfirmEdits,
  onCancelEdits,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or suggestions change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, editSuggestions]);

  const hasEditSuggestions =
    editSuggestions && editSuggestions.edits?.length > 0;

  return (
    <div
      ref={scrollRef}
      className={cn(
        'no-scrollbar flex flex-col gap-3 overflow-y-auto px-4 py-4',
        className,
      )}
    >
      {/* Loading state when no messages yet */}
      {isThinking && messages.length === 0 && (
        <OverseerThinkingIndicator message={thinkingMessage} centered />
      )}

      {/* Initial prompt when no messages and not thinking */}
      {!isThinking && messages.length === 0 && (
        <div className='flex h-full flex-col items-center justify-center p-4 text-center opacity-70'>
          <p className='text-sm text-white'>
            Ask anything about the selected content or request edits.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <OverseerChatMessage key={message.uuid} message={message} />
      ))}

      {/* Edit Suggestions */}
      {hasEditSuggestions && onConfirmEdits && onCancelEdits && (
        <OverseerEditSuggestions
          reply={editSuggestions.reply}
          edits={editSuggestions.edits}
          onConfirm={onConfirmEdits}
          onCancel={onCancelEdits}
        />
      )}

      {/* Thinking indicator when there are existing messages */}
      {isThinking && messages.length > 0 && !hasEditSuggestions && (
        <OverseerThinkingIndicator message={thinkingMessage} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default OverseerChat;

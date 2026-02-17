import { IAiEditingSuggestion } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { OverseerMessage } from '@stores/overseer/store';
import {
  AgentStep,
  IOverseerAssistantMessage,
  IOverseerEditSuggestionMessage,
  IOverseerEditSuggestions,
} from '@stores/overseer/types';
import React, { useEffect, useRef } from 'react';
import AgentThinkingSteps from './AgentThinkingSteps';
import AIEditCarousel from './AIEditCarousel';
import OverseerChatMessage from './OverseerChatMessage';

interface OverseerChatProps {
  messages: OverseerMessage[];
  className?: string;
  editSuggestions?: IOverseerEditSuggestions | null;
  onConfirmEdits?: (selectedEdits: IAiEditingSuggestion[]) => void;
  onCancelEdits?: () => void;
  isApplyingEdits?: boolean;
  isThinking?: boolean;
  toolActivitySteps?: AgentStep[];
  onActiveEditChange?: (edit: IAiEditingSuggestion) => void;
}

/**
 * Chat messages area for Overseer
 * Displays conversation history with auto-scroll to bottom
 */
const OverseerChat: React.FC<OverseerChatProps> = ({
  messages,
  className,
  editSuggestions,
  onConfirmEdits,
  onCancelEdits,
  isApplyingEdits,
  isThinking,
  toolActivitySteps,
  onActiveEditChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasEditSuggestions =
    editSuggestions && editSuggestions.edits?.length > 0;

  // Auto-scroll to bottom when messages, suggestions, or thinking state change.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, editSuggestions, isThinking, toolActivitySteps]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'no-scrollbar space-y-3 overflow-y-auto px-4 py-4',
        className,
      )}
    >
      {/* Messages */}
      {messages.map((message) =>
        message.role === 'edit_suggestion' ? (
          <AIEditCarousel
            key={message.uuid}
            edits={
              (message as IOverseerEditSuggestionMessage).editSuggestions.edits
            }
            reply={
              (message as IOverseerEditSuggestionMessage).editSuggestions.reply
            }
            readOnly
          />
        ) : (
          <OverseerChatMessage
            key={message.uuid}
            message={message}
            toolActivitySteps={
              message.role === 'assistant'
                ? (message as IOverseerAssistantMessage).toolActivitySteps
                : undefined
            }
          />
        ),
      )}

      {/* Edit suggestions as carousel */}
      {hasEditSuggestions && onConfirmEdits && onCancelEdits && (
        <AIEditCarousel
          edits={editSuggestions.edits}
          reply={editSuggestions.reply}
          onConfirm={onConfirmEdits}
          onCancel={onCancelEdits}
          isLoading={isApplyingEdits}
          onActiveEditChange={onActiveEditChange}
        />
      )}

      {/* Tool activity steps — visible as long as steps exist (even after response arrives) */}
      {toolActivitySteps &&
        toolActivitySteps.length > 0 &&
        !hasEditSuggestions && <AgentThinkingSteps steps={toolActivitySteps} />}

      {/* Typing indicator — only when thinking without tool steps */}
      {isThinking &&
        !hasEditSuggestions &&
        (!toolActivitySteps || toolActivitySteps.length === 0) && (
          <div className='flex justify-start'>
            <div
              className='rounded-lg border border-white/[0.08] px-4 py-3'
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <span className='flex gap-1'>
                <span
                  className='h-1.5 w-1.5 animate-bounce rounded-full bg-white/30'
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className='h-1.5 w-1.5 animate-bounce rounded-full bg-white/30'
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className='h-1.5 w-1.5 animate-bounce rounded-full bg-white/30'
                  style={{ animationDelay: '300ms' }}
                />
              </span>
            </div>
          </div>
        )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default OverseerChat;

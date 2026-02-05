// @ts-nocheck
// DEPRECATED: This component is no longer used. Use Concept Report Workshop tab instead.
/**
 * GenerationProgress Component
 *
 * Displays progress messages during component generation.
 * Shows real-time streaming messages with appropriate styling based on type.
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import type { IAgentMessage } from '@libs/api/types/dynamicComponent.d';

interface IGenerationProgressProps {
  /** Agent messages from generation */
  messages: IAgentMessage[];
  /** Maximum number of messages to display */
  maxMessages?: number;
  /** Whether to auto-scroll to latest message */
  autoScroll?: boolean;
}

/**
 * Truncate message content for display
 */
const truncateMessage = (content: string, maxLength: number = 500): string => {
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}...`;
};

/**
 * Format tool use messages for better readability
 */
const formatToolUse = (content: string): { tool: string; preview: string } => {
  const lines = content.split('\n');
  const toolLine = lines.find((l) => l.startsWith('Tool:'));
  const tool = toolLine ? toolLine.replace('Tool:', '').trim() : 'Tool';

  // Get a preview of what the tool is doing
  const inputLine = lines.find(
    (l) => l.includes('Input:') || l.includes('Path:'),
  );
  const preview = inputLine || lines[1] || 'Executing...';

  return { tool, preview: truncateMessage(preview, 100) };
};

/**
 * Get icon and label for message type
 */
const getMessageTypeInfo = (type: IAgentMessage['type']) => {
  switch (type) {
    case 'thinking':
      return { icon: 'lightbulb' as const, label: 'Thinking' };
    case 'tool_use':
      return { icon: 'gear' as const, label: 'Tool Use' };
    case 'tool_result':
      return { icon: 'check' as const, label: 'Result' };
    case 'system':
      return { icon: 'alert-circle' as const, label: 'System' };
    case 'error':
      return { icon: 'alert-triangle' as const, label: 'Error' };
    case 'text':
    default:
      return { icon: 'message-circle' as const, label: 'Message' };
  }
};

/**
 * GenerationProgress - Shows generation progress messages
 */
const GenerationProgress: React.FC<IGenerationProgressProps> = ({
  messages,
  maxMessages = 50,
  autoScroll = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // Display recent messages (filter out less important ones if needed)
  const displayMessages = useMemo(() => {
    return messages.slice(-maxMessages);
  }, [messages, maxMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (
      autoScroll &&
      scrollRef.current &&
      messages.length > prevMessageCountRef.current
    ) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, autoScroll]);

  if (displayMessages.length === 0) {
    return null;
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary mt-6 rounded-2xl border p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
          Generation Progress
        </h3>
        <div className='flex items-center gap-2'>
          <Icon
            variant='loading-02'
            className='aucctus-stroke-brand-primary h-4 w-4 animate-spin'
          />
          <span className='aucctus-text-xs aucctus-text-tertiary'>
            {messages.length} messages
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className='max-h-96 space-y-2 overflow-y-auto'
        role='log'
        aria-live='polite'
        aria-label='Generation progress messages'
      >
        {displayMessages.map((message, index) => {
          const typeInfo = getMessageTypeInfo(message.type);
          const isToolUse = message.type === 'tool_use';
          const toolInfo = isToolUse
            ? formatToolUse(message.content)
            : { tool: '', preview: '' };

          return (
            <div
              key={`${message.type}-${index}-${message.timestamp}`}
              className={cn(
                'aucctus-text-xs flex gap-2 rounded-lg p-3 transition-all',
                {
                  'aucctus-bg-secondary aucctus-text-secondary':
                    message.type === 'text',
                  'aucctus-bg-info-subtle aucctus-text-info-primary':
                    message.type === 'thinking',
                  'aucctus-bg-brand-secondary aucctus-text-brand-primary':
                    message.type === 'tool_use',
                  'aucctus-bg-success-subtle aucctus-text-success-primary':
                    message.type === 'tool_result',
                  'aucctus-bg-accent-secondary aucctus-text-accent-primary':
                    message.type === 'system',
                  'aucctus-bg-error-subtle aucctus-text-error-primary':
                    message.type === 'error',
                },
              )}
            >
              <Icon
                variant={typeInfo.icon}
                className={cn('mt-0.5 h-4 w-4 flex-shrink-0', {
                  'aucctus-stroke-secondary': message.type === 'text',
                  'aucctus-stroke-info-primary': message.type === 'thinking',
                  'aucctus-stroke-brand-primary': message.type === 'tool_use',
                  'aucctus-stroke-success-primary':
                    message.type === 'tool_result',
                  'aucctus-stroke-accent-primary': message.type === 'system',
                  'aucctus-stroke-error-primary': message.type === 'error',
                })}
              />
              <div className='flex-1'>
                <div className='aucctus-text-xs-semibold mb-0.5'>
                  {isToolUse ? toolInfo.tool : typeInfo.label}
                </div>
                <div className='whitespace-pre-wrap'>
                  {isToolUse
                    ? toolInfo.preview
                    : truncateMessage(message.content)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GenerationProgress;

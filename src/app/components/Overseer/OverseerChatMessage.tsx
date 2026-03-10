import { cn } from '@libs/utils/react';
import {
  AgentStep,
  IOverseerAssistantMessage,
  IOverseerNavigateSuggestion,
  IOverseerUserMessage,
} from '@stores/overseer/types';
import useStore from '@stores/store';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import AgentThinkingSteps from './AgentThinkingSteps';
import SourceBadges from './SourceBadges';

interface OverseerChatMessageProps {
  message: IOverseerUserMessage | IOverseerAssistantMessage;
  className?: string;
  toolActivitySteps?: AgentStep[];
  navigateSuggestion?: IOverseerNavigateSuggestion | null;
}

/**
 * Individual chat message component for Overseer
 * User messages: right-aligned with bg-white/10 bubble
 * Assistant messages: left-aligned, glass card with border, no avatar (Lovable style)
 */
const OverseerChatMessage: React.FC<OverseerChatMessageProps> = ({
  message,
  className,
  toolActivitySteps,
  navigateSuggestion,
}) => {
  const profileImage = useStore((state) => state.auth.user?.profileImage);
  const firstName = useStore((state) => state.auth.user?.firstName);
  const lastName = useStore((state) => state.auth.user?.lastName);

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('flex items-start justify-end gap-2', className)}
      >
        <div className='max-w-[85%] rounded-lg bg-white/10 px-3.5 py-2'>
          {message.images && message.images.length > 0 && (
            <div className='mb-1.5 flex flex-wrap gap-1'>
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={img.dataUrl}
                  alt={img.filename ?? `Image ${i + 1}`}
                  className='h-16 w-16 rounded border border-white/10 object-cover'
                />
              ))}
            </div>
          )}
          <div className='whitespace-pre-line text-[13px] font-light leading-relaxed text-white/90'>
            {message.content}
          </div>
        </div>
        <div className='h-[29px] w-[29px] flex-shrink-0 overflow-hidden rounded-md'>
          {profileImage ? (
            <img
              src={profileImage}
              alt={firstName ?? 'User'}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-white/15 text-[11px] font-medium text-white/60'>
              {firstName?.charAt(0) ?? ''}
              {lastName?.charAt(0) ?? ''}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex justify-start', className)}
    >
      <div className='flex max-w-[92%] flex-col gap-1.5'>
        {toolActivitySteps && toolActivitySteps.length > 0 && (
          <AgentThinkingSteps steps={toolActivitySteps} />
        )}
        <div
          className='rounded-lg border border-white/[0.08] px-4 py-3'
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          <ReactMarkdown
            className='prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 max-w-none'
            components={{
              p: ({ children }) => (
                <p className='my-1 text-sm text-white/80'>{children}</p>
              ),
              ul: ({ children }) => (
                <ul className='my-1 list-disc pl-4 text-white/80'>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className='my-1 list-decimal pl-4 text-white/80'>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className='my-0.5 text-sm text-white/80'>{children}</li>
              ),
              strong: ({ children }) => (
                <strong className='font-semibold text-white'>{children}</strong>
              ),
              h1: ({ children }) => (
                <h1 className='my-2 text-xl font-bold text-white'>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className='my-2 text-lg font-bold text-white'>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className='my-1 text-base font-semibold text-white'>
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className='my-1 text-sm font-semibold text-white'>
                  {children}
                </h4>
              ),
              blockquote: ({ children }) => (
                <blockquote className='my-2 border-l-2 border-white/30 pl-3 italic text-white/60'>
                  {children}
                </blockquote>
              ),
              code: ({ className: codeClassName, children, ...props }: any) => {
                const isInline = !codeClassName?.includes('language-');
                return (
                  <code
                    className={cn(
                      'font-mono text-sm text-white',
                      isInline
                        ? 'rounded bg-white/10 px-1 py-0.5'
                        : 'block w-full overflow-x-auto rounded-lg bg-black/40 p-3',
                      codeClassName,
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className='my-2 w-full overflow-hidden rounded-lg'>
                  {children}
                </pre>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-300 underline hover:text-blue-200'
                >
                  {children}
                </a>
              ),
              hr: () => <hr className='my-4 border-white/20' />,
              table: ({ children }) => (
                <div className='my-2 w-full overflow-x-auto'>
                  <table className='w-full text-left text-sm text-white/80'>
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className='border-b border-white/20 p-2 font-semibold text-white'>
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className='border-b border-white/10 p-2'>{children}</td>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
          {message.sources && message.sources.length > 0 && (
            <SourceBadges
              sources={message.sources.filter((s) => s.name && s.url)}
            />
          )}
        </div>
        {navigateSuggestion && <NavigateChip navigate={navigateSuggestion} />}
      </div>
    </motion.div>
  );
};

/**
 * Red-themed navigation chip (matching Lovable mockup).
 * Clicking triggers the section highlight overlay.
 */
const NavigateChip: React.FC<{ navigate: IOverseerNavigateSuggestion }> = ({
  navigate,
}) => {
  const setHighlightedSection = useStore(
    (state) => state.overseer.setHighlightedSection,
  );

  return (
    <button
      onClick={() => setHighlightedSection(navigate.sectionId)}
      className='mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors'
      style={{
        background: 'rgba(163,13,19,0.15)',
        borderColor: 'rgba(163,13,19,0.3)',
        color: 'rgba(255,180,180,0.9)',
      }}
    >
      <MapPin className='h-3 w-3' />
      {navigate.sectionName}
    </button>
  );
};

export default OverseerChatMessage;

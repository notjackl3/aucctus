import NavLogo from '@assets/aucctus_logo.png';
import { cn } from '@libs/utils/react';
import { OverseerMessage } from '@stores/overseer/store';
import { motion } from 'framer-motion';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface OverseerChatMessageProps {
  message: OverseerMessage;
  className?: string;
}

/**
 * Individual chat message component for Overseer
 * Renders user messages on the right, assistant messages on the left
 * Features subtle background styling and markdown support
 */
const OverseerChatMessage: React.FC<OverseerChatMessageProps> = ({
  message,
  className,
}) => {
  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('flex flex-row-reverse gap-2.5', className)}
      >
        <div className='aucctus-bg-frosted-glass max-w-[85%] rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur-md'>
          <span className='aucctus-text-sm text-white/90'>
            {message.content}
          </span>
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
      className={cn('flex flex-row gap-3', className)}
    >
      <div className='mt-1 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner'>
        <img
          src={NavLogo}
          alt='Aucctus'
          className='h-full w-full object-contain p-1.5'
        />
      </div>
      <div className='aucctus-bg-frosted-glass max-w-[85%] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md'>
        <div>
          <ReactMarkdown
            className='prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 max-w-none'
            components={{
              p: ({ children }) => (
                <p className='aucctus-text-sm my-1 text-white/80'>{children}</p>
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
                <li className='aucctus-text-sm my-0.5 text-white/80'>
                  {children}
                </li>
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
              code: ({ className, children, ...props }: any) => {
                const isInline = !className?.includes('language-');
                return (
                  <code
                    className={cn(
                      'font-mono text-sm text-white',
                      isInline
                        ? 'rounded bg-white/10 px-1 py-0.5'
                        : 'block w-full overflow-x-auto rounded-lg bg-black/40 p-3',
                      className,
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
        </div>
      </div>
    </motion.div>
  );
};

export default OverseerChatMessage;

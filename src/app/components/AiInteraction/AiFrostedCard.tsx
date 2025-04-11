import { cn } from '@libs/utils/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import IconContainer from '@components/AiInteraction/IconContainer';
type CardVariant = 'light' | 'dark';

interface AiFrostedCardProps {
  title?: string;
  message?: string;
  leadingIcon?: IconVariant;
  trailingIcon?: IconVariant;
  onClick?: () => void;
  titleClassName?: string;
  messageClassName?: string;
  children?: React.ReactNode; // ignore all props (except 'variant', 'className') if children are provided
  className?: string;
  variant?: CardVariant;
}

// Consistent styles extracted as constants
const STYLES = {
  text: {
    filter: 'contrast(2)',
  },
  card: {
    backdropFilter: 'blur(20px) brightness(0.8) contrast(1.2)',
  },
};

/**
 * AiFrostedCard - A frosted glass effect card component with light/dark variants
 *
 * @param props - Component props
 * @returns React component
 */
const AiFrostedCard: React.FC<AiFrostedCardProps> = ({
  title,
  message,
  onClick,
  className,
  titleClassName,
  messageClassName,
  leadingIcon,
  trailingIcon,
  variant = 'light',
  children,
}) => {
  // Theme classes based on variant
  const themeClasses = {
    card:
      variant === 'light' ? 'aucctus-bg-tertiary' : 'aucctus-bg-primary-solid',
    title: variant === 'light' ? '!text-gray-light-200' : '!text-white',
    message:
      variant === 'light' ? '!text-gray-light-200' : '!text-gray-light-100',
    icon:
      variant === 'light' ? 'stroke-gray-light-200' : 'stroke-gray-light-100',
  };

  // Base card classes
  const baseCardClasses = cn(
    'aucctus-border-primary animate-fade-in flex flex-col gap-2 rounded-lg border border-opacity-50 bg-opacity-25 p-4 backdrop-blur-lg transition-all duration-200 h-fit',
    themeClasses.card,
    className,
  );

  // Render children directly if provided
  if (children) {
    return (
      <div style={STYLES.card} className={baseCardClasses}>
        {children}
      </div>
    );
  }

  // Interactive card classes
  const interactiveClasses = onClick
    ? {
        'hover:brightness-125': true,
        'cursor-pointer': true,
      }
    : {};

  return (
    <div
      onClick={onClick}
      style={STYLES.card}
      className={cn(baseCardClasses, interactiveClasses)}
    >
      <div className='flex flex-row gap-2'>
        {leadingIcon && (
          <IconContainer
            iconVariant={leadingIcon}
            iconClassName={themeClasses.icon}
          />
        )}

        <div className='flex flex-col gap-2'>
          {title && (
            <div
              style={STYLES.text}
              className={cn(
                'aucctus-text-md-medium',
                themeClasses.title,
                titleClassName,
              )}
            >
              {title}
            </div>
          )}

          {message && (
            <div
              style={STYLES.text}
              className={cn(
                'aucctus-text-sm transition-all',
                themeClasses.message,
                messageClassName,
              )}
            >
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          )}
        </div>

        {trailingIcon && (
          <IconContainer
            iconVariant={trailingIcon}
            iconClassName={themeClasses.icon}
          />
        )}
      </div>
    </div>
  );
};

export default AiFrostedCard;

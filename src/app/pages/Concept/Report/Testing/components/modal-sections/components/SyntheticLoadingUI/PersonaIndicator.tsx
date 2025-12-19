import { Icon } from '@components';
import { ICustomerProfile } from '@libs/api/types/concept/concepts';
import { cn } from '@libs/utils/react';
import React, { useRef } from 'react';
import { AnimatedSpeechBubble } from './AnimatedSpeechBubble';

interface PersonaIndicatorProps {
  profile: ICustomerProfile;
  status: 'pending' | 'processing' | 'completed';
  isLast: boolean;
  quotes: Array<{ text: string; profileUuid: string }>;
  bubblePosition: 'top' | 'bottom';
  isActive?: boolean;
}

export const PersonaIndicator: React.FC<PersonaIndicatorProps> = ({
  profile,
  status,
  quotes,
  bubblePosition,
  isActive = false,
}) => {
  const avatarRef = useRef<HTMLDivElement>(null);

  // Get the most recent quote for this profile
  const latestQuote = quotes.length > 0 ? quotes[quotes.length - 1].text : null;

  // Determine styles based on active state and status
  const getStyles = () => {
    if (isActive) {
      return {
        container: 'scale-110',
        border: 'border-4 aucctus-border-brand shadow-lg',
        avatar: 'opacity-100',
      };
    }

    switch (status) {
      case 'completed':
        return {
          container: 'scale-100',
          border: 'border-4 border-green-500',
          avatar: 'opacity-100',
        };
      case 'processing':
        return {
          container: 'scale-100 opacity-60',
          border: 'border-2 aucctus-border-secondary',
          avatar: 'opacity-100',
        };
      default: // pending
        return {
          container: 'scale-100 opacity-60',
          border: 'border-2 aucctus-border-secondary',
          avatar: 'opacity-100',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-2 transition-all duration-500',
        styles.container,
      )}
    >
      {/* Avatar with status border */}
      <div className='relative' ref={avatarRef}>
        {/* Show animated speech bubble if there's a quote */}
        {latestQuote && (
          <AnimatedSpeechBubble quote={latestQuote} position={bubblePosition} />
        )}
        <div
          className={cn(
            'overflow-hidden rounded-full transition-all duration-500',
            styles.border,
          )}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className={cn(
                'h-16 w-16 object-cover transition-opacity duration-300',
                styles.avatar,
              )}
            />
          ) : (
            <div
              className={cn(
                'aucctus-bg-secondary flex h-16 w-16 items-center justify-center transition-opacity duration-300',
                styles.avatar,
              )}
            >
              <Icon
                variant='user-square'
                className='aucctus-stroke-secondary h-8 w-8'
              />
            </div>
          )}
        </div>

        {/* Active indicator - green pulsing dot at top-right */}
        {isActive && (
          <div className='absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full bg-green-500' />
        )}

        {/* Completed indicator - checkmark at bottom-right */}
        {status === 'completed' && !isActive && (
          <div className='absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1'>
            <Icon variant='check' className='h-3 w-3 stroke-white stroke-2' />
          </div>
        )}
      </div>

      {/* Persona Label - simplified to just segment */}
      <div className='text-center'>
        <div className='aucctus-text-xs font-medium'>{profile.segment}</div>
      </div>
    </div>
  );
};

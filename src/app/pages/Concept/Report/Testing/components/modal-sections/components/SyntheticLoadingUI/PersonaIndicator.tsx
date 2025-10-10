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
}

export const PersonaIndicator: React.FC<PersonaIndicatorProps> = ({
  profile,
  status,
  quotes,
  bubblePosition,
}) => {
  const avatarRef = useRef<HTMLDivElement>(null);

  // Get the most recent quote for this profile
  const latestQuote = quotes.length > 0 ? quotes[quotes.length - 1].text : null;

  const getStatusStyles = () => {
    switch (status) {
      case 'processing':
        return {
          border: 'border-4 border-amber-600',
          avatar: 'opacity-100',
          animation: 'animate-pulse',
        };
      case 'completed':
        return {
          border: 'border-4 border-green-500',
          avatar: 'opacity-100',
          animation: '',
        };
      default: // pending
        return {
          border: 'border-2 aucctus-border-secondary',
          avatar: 'opacity-60',
          animation: '',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className='relative flex flex-col items-center gap-3'>
      {/* Avatar with status border */}
      <div className='relative' ref={avatarRef}>
        {/* Show animated speech bubble if there's a quote */}
        {latestQuote && (
          <AnimatedSpeechBubble quote={latestQuote} position={bubblePosition} />
        )}
        <div
          className={cn(
            'overflow-hidden rounded-full transition-all duration-300',
            styles.border,
            styles.animation,
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

        {/* Status indicator */}
        {status === 'completed' && (
          <div className='absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1'>
            <Icon variant='check' className='h-3 w-3 stroke-white stroke-2' />
          </div>
        )}
      </div>

      {/* Persona Label */}
      <div className='text-center'>
        <div className='aucctus-text-primary aucctus-text-sm font-medium'>
          {profile.segment}
        </div>
        <div className='aucctus-text-secondary aucctus-text-xs'>
          {profile.name}
        </div>
      </div>
    </div>
  );
};

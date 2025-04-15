import { Loading } from '@components';

import { cn } from '@libs/utils/react';
import React from 'react';

type cardVariant = 'light' | 'dark';

interface FrostedLoadingCardProps {
  className?: string;
  defaultMessage?: string;
  variant?: cardVariant;
  message?: string;
}

const cardStyle = {
  backdropFilter: 'blur(20px) brightness(0.8) contrast(1.2)',
};

const FrostedLoadingCard: React.FC<FrostedLoadingCardProps> = ({
  className,
  defaultMessage,
  variant = 'light',
  message,
}) => {
  const msg = message || defaultMessage;

  const cardClassName =
    variant === 'light' ? 'aucctus-bg-tertiary' : 'aucctus-bg-primary-solid';
  const textClassName =
    variant === 'light' ? 'text-gray-light-200' : 'text-white';

  return (
    <div
      style={cardStyle}
      className={cn(
        'aucctus-border-primary flex animate-fade-in flex-col gap-2 rounded-lg border border-opacity-50 bg-opacity-25 p-4 backdrop-blur-lg transition-all duration-200',
        className,
        cardClassName,
      )}
    >
      {msg ? (
        <div className='flex flex-1 flex-row gap-2'>
          <span className={cn('aucctus-text-sm', textClassName)}>{msg}</span>
          <span className='flex-1' />
          <Loading
            className={cn({ invert: variant === 'dark' })}
            isSmall={true}
          />
        </div>
      ) : (
        <Loading
          className={cn({ invert: variant === 'dark' })}
          isSmall={true}
        />
      )}
    </div>
  );
};

export default FrostedLoadingCard;

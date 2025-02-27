import { cn } from '@libs/utils/react';
import * as Av from '@radix-ui/react-avatar';
import React from 'react';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  src?: string;
  hideImage?: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  firstName = '',
  lastName = '',
  src,
  className = '',
}) => {
  const initials = React.useMemo(
    () => [firstName, lastName].map((name) => name.charAt(0)).join(''),
    [firstName, lastName],
  );

  return (
    <Av.Root
      className={cn(
        'aucctus-border-secondary aucctus-bg-primary-solid h-12 min-h-12 w-12 min-w-12 rounded-full border bg-opacity-5',
        className,
      )}
    >
      <Av.Image
        className='h-full w-full border-r-inherit object-cover'
        src={src}
        alt={`${firstName} ${lastName}`}
      />
      <Av.Fallback
        className='aucctus-text-secondary flex h-full w-full items-center justify-center bg-transparent text-center font-semibold'
        delayMs={!src ? undefined : 600}
      >
        {initials}
      </Av.Fallback>
    </Av.Root>
  );
};

export default Avatar;

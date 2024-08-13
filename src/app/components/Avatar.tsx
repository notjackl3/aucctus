import * as Av from '@radix-ui/react-avatar';
import React from 'react';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  src?: string;
  hideImage?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ firstName = '', lastName = '', src }) => {
  const initials = React.useMemo(
    () => [firstName, lastName].map((name) => name.charAt(0)).join(''),
    [firstName, lastName],
  );

  return (
    <Av.Root className='h-12 min-h-12 w-12 min-w-12 rounded-full border border-indigo-50 bg-indigo-50'>
      <Av.Image className='h-full w-full border-r-inherit object-cover' src={src} alt={`${firstName} ${lastName}`} />
      <Av.Fallback
        className='flex h-full w-full items-center justify-center bg-transparent text-center font-semibold text-primary-500'
        delayMs={600}
      >
        {initials}
      </Av.Fallback>
    </Av.Root>
  );
};

export default Avatar;

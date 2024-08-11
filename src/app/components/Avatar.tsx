import * as Av from '@radix-ui/react-avatar';
import React from 'react';

import images from '@assets/img';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  src?: string;
  hideImage?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ firstName = '', lastName = '', src = images.avatar, hideImage = false }) => {
  const initials = React.useMemo(
    () => [firstName, lastName].map((name) => name.charAt(0)).join(''),
    [firstName, lastName],
  );

  return (
    <Av.Root className='h-12 min-h-12 w-12 min-w-12 rounded-full border border-gray-100 bg-gray-50 shadow-md'>
      <Av.Image
        className='h-full w-full border-r-inherit object-cover'
        src={hideImage ? '' : src}
        alt={`${firstName} ${lastName}`}
      />
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

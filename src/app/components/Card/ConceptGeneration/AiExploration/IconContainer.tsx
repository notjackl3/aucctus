import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';

const IconContainer = ({
  iconVariant,
  iconClassName,
}: {
  iconVariant: IconVariant;
  iconClassName: string;
}) => (
  <span className='aucctus-border-primary mt-1 flex aspect-square h-10 w-10 items-center justify-center rounded-lg border border-opacity-50'>
    <Icon
      variant={iconVariant}
      className={cn(iconClassName)}
      height={20}
      width={20}
    />
  </span>
);

export default IconContainer;

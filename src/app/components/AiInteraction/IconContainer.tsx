import { cn } from '@libs/utils/react';
import React from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface IconContainerProps {
  iconVariant: string;
  iconClassName: string;
}

const IconContainer: React.FC<IconContainerProps> = ({
  iconVariant,
  iconClassName,
}) => (
  <span className='aucctus-border-primary mt-1 flex aspect-square h-10 w-10 items-center justify-center rounded-lg border border-opacity-50'>
    <DynamicIcon
      variant={iconVariant}
      className={cn(iconClassName)}
      height={20}
      width={20}
    />
  </span>
);

export default IconContainer;

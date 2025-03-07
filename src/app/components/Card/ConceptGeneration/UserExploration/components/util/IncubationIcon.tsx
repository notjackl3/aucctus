import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React from 'react';

interface IncubationIconProps {
  height?: number;
  width?: number;
  variant: IconVariant;
  className?: string;
  iconClassName?: string;
}

const boxShadowStyle = {
  boxShadow: `0px -2px 0px 0px rgba(20, 20, 20, 0.05) inset, 0px 1px 4px rgba(0, 0, 0, 0.05)`,
};

const IncubationIcon: React.FC<IncubationIconProps> = ({
  height = 14,
  width = 14,
  className = '',
  iconClassName = '',
  variant,
}) => {
  return (
    <span
      style={boxShadowStyle}
      className={cn(
        'aucctus-bg-tertiary aucctus-border-primary flex !aspect-square h-12 w-12 items-center justify-center rounded-lg border-2 align-middle',
        className,
      )}
    >
      <Icon variant={variant} className={cn('h-8 w-8', iconClassName)} />
    </span>
  );
};

export default IncubationIcon;

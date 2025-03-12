import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface IncubationIconProps {
  size?: 'default' | 'small' | 'large';
  variant: IconVariant;
  className?: string;
  iconClassName?: string;
}

const boxShadowStyle = {
  boxShadow: `0px -2px 0px 0px rgba(20, 20, 20, 0.05) inset, 0px 1px 4px rgba(0, 0, 0, 0.05)`,
};

const DIMENSION_MAP = {
  default: 14,
  small: 12,
  large: 16,
};

export const IncubationIcon = ({
  size = 'default',
  className = '',
  iconClassName = '',
  variant,
}: IncubationIconProps) => {
  const dimension = DIMENSION_MAP[size];

  return (
    <span
      style={boxShadowStyle}
      className={cn(
        'aucctus-bg-tertiary aucctus-border-primary flex !aspect-square h-12 w-12 items-center justify-center rounded-lg border-2 align-middle',
        className,
      )}
    >
      <Icon
        variant={variant}
        width={dimension}
        height={dimension}
        className={cn('h-8 w-8', iconClassName)}
      />
    </span>
  );
};

export default IncubationIcon;

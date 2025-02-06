import { cn } from '@libs/utils/react';
import React from 'react';

interface BadgeProps {
  value: number | string;
  classNameBadge?: string; // Custom classes for the badge container
  classNameLabel?: string; // Custom classes for the label inside the badge
}

const Badge: React.FC<BadgeProps> = ({
  value,
  classNameBadge = '',
  classNameLabel = '',
}) => {
  const defaultBadgeStyles =
    'inline-flex h-6 items-center justify-center gap-0.5 rounded-full p-2';
  const defaultLabelStyles = 'text-center text-xs font-medium leading-[18px]';

  return (
    <div className={cn(defaultBadgeStyles, classNameBadge)}>
      <span className={cn(defaultLabelStyles, classNameLabel)}>{value}</span>
    </div>
  );
};

export default Badge;

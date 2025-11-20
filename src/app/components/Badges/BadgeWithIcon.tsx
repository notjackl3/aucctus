import React from 'react';
import { cn } from '@libs/utils/react';

interface BadgeWithIconProps {
  children: React.ReactNode;
  className?: string;
}

const BadgeWithIcon: React.FC<BadgeWithIconProps> = ({
  children,
  className = '',
}) => {
  const defaultBadgeStyles =
    'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm';

  return <div className={cn(defaultBadgeStyles, className)}>{children}</div>;
};

export default BadgeWithIcon;

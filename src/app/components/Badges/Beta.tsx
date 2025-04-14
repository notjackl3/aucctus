import { cn } from '@libs/utils/react';
import React from 'react';

interface BetaProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Beta: React.FC<BetaProps> = ({ className, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'aucctus-text-xs-bold',
    sm: 'aucctus-text-sm-bold',
    md: 'aucctus-text-md-bold',
    lg: 'aucctus-text-lg-bold',
    xl: 'aucctus-text-xl-bold',
  };

  return (
    <span
      className={cn(
        'aucctus-bg-brand-secondary aucctus-text-brand-tertiary rounded-full px-2 py-0.5 capitalize',
        sizeClasses[size],
        className,
      )}
    >
      BETA
    </span>
  );
};

export default Beta;

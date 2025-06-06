import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface AiInsightCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const AiInsightCard: React.FC<AiInsightCardProps> = ({
  children,
  className = '',
  title = 'AUCCTUS INSIGHT',
  variant = 'default',
}) => {
  // Define variant-specific styles
  const variantStyles = {
    default: {
      container: 'aucctus-bg-secondary aucctus-border-secondary',
      icon: 'aucctus-bg-brand-secondary',
      iconStroke: 'aucctus-stroke-brand-primary',
      titleText: 'aucctus-text-brand-primary',
    },
    success: {
      container: 'aucctus-bg-success-secondary aucctus-border-success',
      icon: 'aucctus-bg-success-primary',
      iconStroke: 'aucctus-stroke-success-primary',
      titleText: 'aucctus-text-success-primary',
    },
    warning: {
      container: 'aucctus-bg-warning-secondary aucctus-border-warning',
      icon: 'aucctus-bg-warning-primary',
      iconStroke: 'aucctus-stroke-warning-primary',
      titleText: 'aucctus-text-warning-primary',
    },
    error: {
      container: 'aucctus-bg-error-secondary aucctus-border-error',
      icon: 'aucctus-bg-error-primary',
      iconStroke: 'aucctus-stroke-error-primary',
      titleText: 'aucctus-text-error-primary',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn('mb-6 rounded-lg border p-5', styles.container, className)}
    >
      <div className='mb-3 flex items-center'>
        <div className='flex items-center'>
          <div className={cn('mr-2 rounded-full p-1.5', styles.icon)}>
            <Icon
              variant='lightbulb'
              className={cn('h-5 w-5', styles.iconStroke)}
            />
          </div>
          <span className={cn('aucctus-text-sm-semibold', styles.titleText)}>
            {title}
          </span>
        </div>
      </div>
      <p className='aucctus-text-md aucctus-text-secondary'>{children}</p>
    </div>
  );
};

export default AiInsightCard;

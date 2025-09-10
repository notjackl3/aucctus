import { cn } from '@libs/utils/react';
import { FunctionComponent, ReactNode } from 'react';
import Icon from '../Icon';

export interface IBannerProps {
  title: string;
  description: string | ReactNode;
  onAction?: () => void;
  className?: string;
  isLoading?: boolean;
  buttonText?: string;
  iconVariant?: string;
  variant?: 'primary' | 'warning' | 'success' | 'error' | 'info';
  showButton?: boolean;
}

const Banner: FunctionComponent<IBannerProps> = ({
  title,
  description,
  onAction,
  className,
  isLoading = false,
  buttonText = 'Action',
  iconVariant = 'announcement',
  variant = 'primary',
  showButton = true,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container:
            'aucctus-bg-warning-primary aucctus-border-warning-primary',
          accent: 'aucctus-bg-warning-solid',
          iconBg: 'aucctus-bg-warning-secondary',
          iconStroke: 'aucctus-stroke-warning-primary',
        };
      case 'success':
        return {
          container:
            'aucctus-bg-success-primary aucctus-border-success-primary',
          accent: 'aucctus-bg-success-solid',
          iconBg: 'aucctus-bg-success-secondary',
          iconStroke: 'aucctus-stroke-success-primary',
        };
      case 'error':
        return {
          container: 'aucctus-bg-error-primary aucctus-border-error-primary',
          accent: 'aucctus-bg-error-solid',
          iconBg: 'aucctus-bg-error-secondary',
          iconStroke: 'aucctus-stroke-error-primary',
        };
      case 'info':
        return {
          container: 'aucctus-bg-info-primary aucctus-border-info-primary',
          accent: 'aucctus-bg-info-solid',
          iconBg: 'aucctus-bg-info-secondary',
          iconStroke: 'aucctus-stroke-info-primary',
        };
      default: // primary
        return {
          container: 'aucctus-bg-primary aucctus-border-secondary',
          accent: 'aucctus-bg-brand-solid',
          iconBg: 'aucctus-bg-brand-primary',
          iconStroke: 'aucctus-stroke-brand-primary',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={cn(
        styles.container,
        'relative mb-6 overflow-hidden rounded-lg border',
        'aucctus-bg-primary-hover transition-all duration-300',
        className,
      )}
    >
      {/* Subtle accent line */}
      <div
        className={cn(styles.accent, 'absolute left-0 top-0 h-0.5 w-full')}
      ></div>

      <div className='flex w-full items-center justify-between p-4'>
        <div className='flex flex-1 items-start gap-3'>
          {/* Icon with variant styling */}
          <div className={cn(styles.iconBg, 'mt-0.5 rounded-full p-1')}>
            <Icon
              variant={iconVariant as any}
              className={styles.iconStroke}
              height={16}
              width={16}
            />
          </div>

          <div className='flex-1'>
            <div className='aucctus-text-primary aucctus-text-md-semibold mb-0.5'>
              {title}
            </div>
            <div className='aucctus-text-secondary aucctus-text-sm'>
              {description}
            </div>
          </div>
        </div>

        {showButton && onAction && (
          <div className='ml-6 flex items-center'>
            <button
              onClick={onAction}
              disabled={isLoading}
              className='btn btn-primary btn-md gap-1 px-4'
            >
              {isLoading ? 'Loading...' : buttonText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;

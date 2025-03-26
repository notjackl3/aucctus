import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { boxShadowStyle } from '../../../../../Icon/QuestionIcon';

interface CompletionIconProps {
  className?: string;
  iconClassName?: string;
  variant?: IconVariant;
  onClick?: () => void;
}

export const CompletionIcon = ({
  className = 'aucctus-bg-secondary ml-2 h-8 w-8',
  iconClassName,
  variant = 'check',
  onClick,
}: CompletionIconProps) => {
  return (
    <span
      style={{ ...boxShadowStyle }}
      onClick={onClick}
      className={cn(
        'aucctus-border-primary z-[10] flex cursor-pointer items-center justify-center rounded-md border stroke-primary-600 p-2',
        className,
      )}
    >
      <Icon className={iconClassName} variant={variant} />
    </span>
  );
};

export default CompletionIcon;

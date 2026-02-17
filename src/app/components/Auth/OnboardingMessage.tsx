import { FunctionComponent } from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface OnboardingMessageProps {
  icon: string;
  color?: string;
  title: string;
  description: string;
}

const COLOR_MAP: Record<string, string> = {
  primary: 'bg-primary-100 [&>svg]:stroke-primary-700',
  success: 'bg-success-100 [&>svg]:stroke-success-700',
  warning: 'bg-warning-100 [&>svg]:stroke-warning-700',
  error: 'bg-error-100 [&>svg]:stroke-error-700',
};

const OnboardingMessage: FunctionComponent<OnboardingMessageProps> = ({
  title,
  description,
  icon,
  color = 'primary',
}) => {
  return (
    <div className='aucctus-border-primary aucctus-bg-primary flex w-[36rem] items-start gap-4 rounded-xl border p-4'>
      <span
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${COLOR_MAP[color] ?? COLOR_MAP.primary}`}
      >
        <DynamicIcon variant={icon} className='h-5 w-5' />
      </span>

      <div className='flex flex-1 flex-col items-start gap-0.5'>
        <span className='aucctus-text-primary aucctus-text-md'>{title}</span>
        <span className='aucctus-text-secondary aucctus-text-sm'>
          {description}
        </span>
      </div>
    </div>
  );
};

export default OnboardingMessage;

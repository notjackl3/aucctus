import { FunctionComponent } from 'react';

import FeatureIcon, { IFeatureIconProps } from '../Icon/FeatureIcon';

interface OnboardingMessageProps extends IFeatureIconProps {
  title: string;
  description: string;
}

const OnboardingMessage: FunctionComponent<OnboardingMessageProps> = ({
  title,
  description,
  icon,
  color,
}) => {
  return (
    <div className='aucctus-border-primary aucctus-bg-primary flex w-[36rem] items-start gap-4 rounded-xl border p-4'>
      <span className='flex h-full items-center justify-center'>
        <FeatureIcon icon={icon} color={color} />
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

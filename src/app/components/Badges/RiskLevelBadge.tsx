import { FunctionComponent } from 'react';

import Icon from '../Icon/Icon/Icon';

const defaultIconProps = {
  width: 16,
  height: 16,
};

type RiskLevelVariant = 'high' | 'medium' | 'low';
export interface RiskLevelProps {
  badgeClassName?: string;
  bulletClassName?: string;
  text: string;
  showBullet?: boolean;
  variant: RiskLevelVariant;
}

const BADGE_VARIANT_MAP: Record<
  RiskLevelVariant,
  { style: string; icon: IconVariant }
> = {
  high: {
    icon: 'alert-octagon',
    style: 'text-error-700 bg-error-50 [&>svg>use]:stroke-error-700',
  },
  medium: {
    icon: 'alert-triangle',
    style: 'text-warning-500 bg-warning-50 [&>svg>use]:stroke-warning-500',
  },
  low: {
    icon: 'alert',
    style: 'text-success-700 bg-success-50 [&>svg>use]:stroke-success-700',
  },
};

const RiskLevel: FunctionComponent<RiskLevelProps> = ({
  badgeClassName,
  text,
  variant,
}) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl py-[0.2rem] pl-[0.4rem] pr-2 shadow-sm ${BADGE_VARIANT_MAP[variant].style} ${
        badgeClassName ? badgeClassName : ''
      }`}
    >
      {variant ? (
        <Icon variant={BADGE_VARIANT_MAP[variant].icon} {...defaultIconProps} />
      ) : null}
      <span
        className={
          'whitespace-nowrap text-center text-sm font-medium capitalize not-italic leading-6'
        }
      >
        {text}
      </span>
    </div>
  );
};

export default RiskLevel;

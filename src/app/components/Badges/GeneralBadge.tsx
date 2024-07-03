import { FunctionComponent } from 'react';

import Icon from '../Icons/Icon/Icon';

const defaultIconProps = {
  width: 16,
  height: 16,
};

type GeneralBadgeVariant = 'high' | 'medium' | 'low';
export interface GeneralBadgeProps {
  badgeClassName?: string;
  bulletClassName?: string;
  badgeText: string;
  showBullet?: boolean;
  iconType?: IconVariant;
  variant?: GeneralBadgeVariant;
}

const BADGE_VARIANT_MAP: Record<GeneralBadgeVariant, { style: string; icon: IconVariant }> = {
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

const GeneralBadge: FunctionComponent<GeneralBadgeProps> = ({
  badgeClassName,
  bulletClassName,
  badgeText,
  iconType,
  showBullet,
  variant,
}) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl bg-neutral-50 py-[0.2rem] pl-[0.4rem] pr-2 ${variant ? BADGE_VARIANT_MAP[variant].style : ''} ${
        badgeClassName ? badgeClassName : ''
      }`}
    >
      {showBullet ? <span className={`bg-primary-400 ${bulletClassName ? bulletClassName : ''}`}>●</span> : null}
      {iconType ? <Icon variant={iconType} {...defaultIconProps} /> : null}
      {variant ? <Icon variant={BADGE_VARIANT_MAP[variant].icon} {...defaultIconProps} /> : null}
      <span className={'whitespace-nowrap text-center text-sm font-medium capitalize not-italic leading-6'}>
        {badgeText}
      </span>
    </div>
  );
};

export default GeneralBadge;

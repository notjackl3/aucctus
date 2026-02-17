import { FunctionComponent } from 'react';

import { RiskCategory } from '@libs/api/types';
import { DynamicIcon } from '@libs/utils/iconMap';

const defaultIconProps = {
  width: 16,
  height: 16,
};

export interface RiskLevelBadgeProps {
  badgeClassName?: string;
  bulletClassName?: string;
  text: string;
  showBullet?: boolean;
  category: RiskCategory;
}

const BADGE_LEVEL_MAP: Record<RiskCategory, { style: string; icon: string }> = {
  high: {
    icon: 'alert-octagon',
    style: 'text-error-700 bg-error-50 [&>svg]:stroke-error-700',
  },
  medium: {
    icon: 'alert-triangle',
    style: 'text-warning-500 bg-warning-50 [&>svg]:stroke-warning-500',
  },
  low: {
    icon: 'alert',
    style: 'text-success-700 bg-success-50 [&>svg]:stroke-success-700',
  },
};

const RiskLevelBadge: FunctionComponent<RiskLevelBadgeProps> = ({
  badgeClassName,
  text,
  category,
}) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl py-[0.2rem] pl-[0.4rem] pr-2 shadow-sm ${BADGE_LEVEL_MAP[category].style} ${
        badgeClassName ? badgeClassName : ''
      }`}
    >
      {category ? (
        <DynamicIcon
          variant={BADGE_LEVEL_MAP[category].icon}
          {...defaultIconProps}
        />
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

export default RiskLevelBadge;

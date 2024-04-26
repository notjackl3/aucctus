import { FunctionComponent } from 'react';

import styles from './generalBadge.module.scss';
import Icon from '../../Icons/Icon/Icon';

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

const GeneralBadge: FunctionComponent<GeneralBadgeProps> = ({
  badgeClassName,
  bulletClassName,
  badgeText,
  iconType,
  showBullet,
  variant,
}) => {
  const getBadgeStyle = (variant: GeneralBadgeVariant) => {
    switch (variant) {
      case 'high':
        return styles.highRisk;
      case 'medium':
        return styles.mediumRisk;
      case 'low':
        return styles.lowRisk;
    }
  };

  const getBadgeIcon = (variant: GeneralBadgeVariant): IconVariant => {
    switch (variant) {
      case 'high':
        return 'alert-octagon';
      case 'medium':
        return 'alert-triangle';
      case 'low':
        return 'check';
    }
  };

  return (
    <div
      className={`${styles.generalBadge} ${variant ? getBadgeStyle(variant) : ''} ${
        badgeClassName ? badgeClassName : ''
      }`}
    >
      {showBullet ? <span className={`${styles.bullet} ${bulletClassName ? bulletClassName : ''}`}>●</span> : null}
      {iconType ? <Icon variant={iconType} {...defaultIconProps} /> : null}
      {variant ? <Icon variant={getBadgeIcon(variant)} {...defaultIconProps} /> : null}
      <span className={styles.badgeText}>{badgeText}</span>
    </div>
  );
};

export default GeneralBadge;

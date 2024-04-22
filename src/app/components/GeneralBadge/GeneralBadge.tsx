import { FunctionComponent } from 'react';

import styles from './styles/generalBadge.module.scss';
import Icon from '../Icon/Icon';

const defaultIconProps = {
  width: 12,
  height: 12,
};

type GeneralBadgeVariant = 'highRisk' | 'mediumRisk' | 'lowRisk';
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
      case 'highRisk':
        return styles.highRisk;
      case 'mediumRisk':
        return styles.mediumRisk;
      case 'lowRisk':
        return styles.lowRisk;
    }
  };

  const getBadgeIcon = (variant: GeneralBadgeVariant): IconVariant => {
    switch (variant) {
      case 'highRisk':
        return 'alert-octagon';
      case 'mediumRisk':
        return 'alert-triangle';
      case 'lowRisk':
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

import { FunctionComponent } from 'react';

import styles from '../assets/styles/components/feature-icon.module.scss';
import Icon, { IconVariant } from './Icon';

const defaultIconProps = {
  stroke: '#FFFFF',
  width: 24,
  height: 24,
};

export interface FeatureIconProps {
  icon: keyof typeof IconVariant;
  color: 'purple' | 'green';
}

const FeatureIcon: FunctionComponent<FeatureIconProps> = ({ icon, color }) => {
  return (
    <div className={`${styles.outerRing} ${color === 'purple' ? styles.purple : styles.green}`}>
      <Icon variant={icon} {...defaultIconProps} />
    </div>
  );
};

export default FeatureIcon;

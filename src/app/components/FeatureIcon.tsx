import { FunctionComponent, useMemo } from 'react';

import styles from '../assets/styles/components/feature-icon.module.scss';
import Icon from './Icon/Icon';

const defaultIconProps = {
  stroke: '#FFFFF',
  width: 24,
  height: 24,
};

export interface IFeatureIconProps {
  icon: IconVariant;
  color: 'purple' | 'green' | 'yellow';
}

const FeatureIcon: FunctionComponent<IFeatureIconProps> = ({ icon, color }) => {
  const colorStyle = useMemo(() => {
    const colorMap = {
      purple: styles.purple,
      green: styles.green,
      yellow: styles.yellow,
    };
    return colorMap[color];
  }, [color]);

  return (
    <div className={`${styles.outerRing} ${colorStyle}`}>
      <Icon variant={icon} {...defaultIconProps} />
    </div>
  );
};

export default FeatureIcon;

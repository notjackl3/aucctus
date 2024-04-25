import { FunctionComponent } from 'react';

import styles from './assumptionBadge.module.scss';
import Icon from '../../Icons/Icon/Icon';
import { AssumptionType } from '../../../../libs/api/types';

export interface IConceptAssumptionBadgeProps {
  assumptionType: AssumptionType;
}

const defaultIconProps = {
  height: 16,
  width: 16,
  stroke: '#2B3674',
};
const assumptionColorObj = {
  desirability: 'purple',
  viability: 'green',
  feasibility: 'lightBlue',
  adaptability: 'blue',
};

const assumptionIconObj = {
  desirability: <Icon variant="thermometer" {...defaultIconProps} />,
  viability: <Icon variant="building" {...defaultIconProps} />,
  feasibility: <Icon variant="filecode" {...defaultIconProps} />,
  adaptability: <Icon variant="line-chart-up" {...defaultIconProps} />,
};
const AssumptionBadge: FunctionComponent<IConceptAssumptionBadgeProps> = ({ assumptionType }) => {
  const color = assumptionColorObj[assumptionType];
  const assumptionIcon = assumptionIconObj[assumptionType];

  return (
    <div className={`${styles.assumptionBadge} ${styles[`${color}Background`]}`}>
      <span className={`${styles.icon} ${styles[`${color}Icon`]}`}>{assumptionIcon}</span>
      <span className={styles.status}>{assumptionType}</span>
    </div>
  );
};

export default AssumptionBadge;

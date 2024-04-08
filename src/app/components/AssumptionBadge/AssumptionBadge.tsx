import { FunctionComponent } from 'react';

import styles from './styles/assumptionBadge.module.scss';
import Icon from '../Icon';

export enum AssumptionType {
  adaptability = 'adaptability',
  desirability = 'desirability',
  feasibility = 'feasibility',
  viability = 'viability',
}

export interface IConceptAssumptionBadgeProps {
  assumptionType: AssumptionType;
}

const defaultIconProps = {
  height: 12,
  width: 12,
  stroke: '#2B3674',
};

const AssumptionBadge: FunctionComponent<IConceptAssumptionBadgeProps> = ({ assumptionType }) => {
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
    adaptability: <Icon variant="lineChartUp" {...defaultIconProps} />,
  };

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

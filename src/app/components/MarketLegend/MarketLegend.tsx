import { FunctionComponent } from 'react';

import styles from './styles/marketLegend.module.scss';
import Icon from '../Icon';

const defaultIconProps = {
  stroke: '',
  width: 20,
  height: 20,
};

export interface MarketLegendProps {
  legendClassName?: string;
  legendText: string;
  legendValue: string;
  bulletColor: 'purple' | 'darkPurple' | 'blue';
}

const MarketLegend: FunctionComponent<MarketLegendProps> = ({
  legendClassName,
  legendText,
  legendValue,
  bulletColor,
}) => {
  return (
    <div className={`${styles.marketLegend} ${legendClassName ? legendClassName : ''}`}>
      <span className={styles.description}>
        <span className={`${styles.bullet} ${styles[bulletColor]}`}>
          <Icon variant="circle" {...defaultIconProps} />
        </span>
        <span className={styles.text}>{legendText}</span>
      </span>
      <span className={styles.text}>{legendValue}</span>
    </div>
  );
};

export default MarketLegend;

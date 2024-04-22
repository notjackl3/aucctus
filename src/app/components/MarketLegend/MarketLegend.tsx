import { FunctionComponent } from 'react';

import styles from './styles/marketLegend.module.scss';
import Icon from '../Icon/Icon';
import { MarketMetricColorType } from '../../../libs/concepts';

const defaultIconProps = {
  stroke: '',
  width: 16,
  height: 16,
};

export interface MarketLegendProps {
  legendClassName?: string;
  legendTextClassName?: string;
  legendText: string;
  legendValue: string;
  bulletColor: MarketMetricColorType;
}

const MarketLegend: FunctionComponent<MarketLegendProps> = ({
  legendClassName,
  legendTextClassName,
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
        <span className={`${styles.text} ${legendTextClassName ? legendTextClassName : ''}`}>{legendText}</span>
      </span>
      <span className={`${styles.text} ${legendTextClassName ? legendTextClassName : ''}`}>{legendValue}</span>
    </div>
  );
};

export default MarketLegend;

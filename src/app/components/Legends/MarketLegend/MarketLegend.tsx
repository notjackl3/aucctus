import { FunctionComponent } from 'react';
import styles from './marketLegend.module.scss';
import { MarketMetricType } from '../../../../libs/api/types';
import { formatter } from '../../../../libs/utils';

interface IMarketLegendProps {
  tam: number;
  sam: number;
  som: number;
}

const MarketLegend: FunctionComponent<IMarketLegendProps> = ({ tam, sam, som }) => {
  return (
    <div className={styles.container}>
      <MarketLegendItem title="Total Addressable Market" metricType="TAM" value={formatter.format(tam)} />
      <MarketLegendItem title="Serviceable Addressable Market" metricType="SAM" value={formatter.format(sam)} />
      <MarketLegendItem title="Serviceable Obtainable Market" metricType="SOM" value={formatter.format(som)} />
    </div>
  );
};

export interface MarketLegendItemProps {
  title: string;
  value: number | string;
  metricType: MarketMetricType;
}

const MarketLegendItem: FunctionComponent<MarketLegendItemProps> = ({ value, title, metricType }) => {
  return (
    <div className={`${styles.marketLegend}`}>
      <div className={`${styles.description}`}>
        <div className={`${styles.bullet} ${styles[metricType]}`} />
        <span className={`${styles.text}`}>{title}</span>
      </div>
      <span className={`${styles.text}`}>{value}</span>
    </div>
  );
};

export default MarketLegend;

import { FunctionComponent } from 'react';

import styles from './styles/marketChart.module.scss';

export interface MarketChartProps {
  chartClass: string;
  largeValue: string;
  mediumValue: string;
  smallValue: string;
}

const MarketChart: FunctionComponent<MarketChartProps> = ({ largeValue, mediumValue, smallValue, chartClass }) => {
  return (
    <svg viewBox="0 0 442 442" className={`${styles.marketChart} ${chartClass ? chartClass : ''}`} fill="black">
      <circle cx="221" cy="221" r="221" fill="#C9BDFF"></circle>
      <circle cx="221" cy="322" r="120" fill="#937BFF"></circle>
      <circle cx="221" cy="382" r="60" fill="#4318FF"></circle>
      <text x="221" y="221" text-anchor="middle" dy="-151" className={styles.text}>
        TAM
      </text>
      <text x="221" y="221" text-anchor="middle" dy="-131" className={styles.text}>
        {largeValue || '0M'}
      </text>
      <text x="221" y="330" text-anchor="middle" dy="-60" className={styles.text}>
        SAM
      </text>
      <text x="221" y="330" text-anchor="middle" dy="-40" className={styles.text}>
        {mediumValue || '0K'}
      </text>
      <text x="221" y="380" text-anchor="middle" dy="-10" className={`${styles.text} ${styles.white}`}>
        SOM
      </text>
      <text x="221" y="380" text-anchor="middle" dy="10" className={`${styles.text} ${styles.white}`}>
        {smallValue || '0K'}
      </text>
    </svg>
  );
};

export default MarketChart;

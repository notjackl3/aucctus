import { FunctionComponent } from 'react';

import styles from './styles/marketChart.module.scss';
import { formatLargeNumber } from '../../../libs/utils';
import { getMediumRatio, getSmallRatio } from './services';

export interface MarketChartProps {
  chartClass?: string;
  largeValue: number;
  mediumValue: number;
  smallValue: number;
}

const MarketChart: FunctionComponent<MarketChartProps> = ({ largeValue, mediumValue, smallValue, chartClass }) => {
  const LARGE_RADIUS = 221;

  const mediumRatio = getMediumRatio(mediumValue, largeValue);
  const smallRatio = getSmallRatio(smallValue, largeValue);

  const largeArea = Math.round(Math.PI * 221 * 221);
  const mediumArea = Math.round(largeArea * mediumRatio);
  const smallArea = Math.round(largeArea * smallRatio);
  const mediumRadius = Math.round(Math.sqrt(mediumArea / Math.PI));
  const smallRadius = Math.round(Math.sqrt(smallArea / Math.PI));

  const mediumCenter = LARGE_RADIUS * 2 - mediumRadius;
  const smallCenter = LARGE_RADIUS * 2 - smallRadius;

  return (
    <svg viewBox="0 0 442 442" className={`${styles.marketChart} ${chartClass ? chartClass : ''}`} fill="black">
      <circle cx={LARGE_RADIUS} cy={LARGE_RADIUS} r={LARGE_RADIUS} fill="#C9BDFF"></circle>
      <circle cx={LARGE_RADIUS} cy={mediumCenter} r={mediumRadius} fill="#937BFF"></circle>
      <circle cx={LARGE_RADIUS} cy={smallCenter} r={smallRadius} fill="#4318FF"></circle>
      <text x={LARGE_RADIUS} y={LARGE_RADIUS} textAnchor="middle" dy="-151" className={styles.text}>
        TAM
      </text>
      <text x={LARGE_RADIUS} y={LARGE_RADIUS} textAnchor="middle" dy="-131" className={styles.text}>
        {formatLargeNumber(largeValue) || '0M'}
      </text>
      <text x={LARGE_RADIUS} y={mediumCenter - mediumRadius} textAnchor="middle" dy="30" className={styles.text}>
        SAM
      </text>
      <text x={LARGE_RADIUS} y={mediumCenter - mediumRadius} textAnchor="middle" dy="50" className={styles.text}>
        {formatLargeNumber(mediumValue) || '0K'}
      </text>
      <text
        x={LARGE_RADIUS}
        y={smallCenter - smallRadius}
        textAnchor="middle"
        dy="30"
        className={`${styles.text} ${styles.white}`}
      >
        SOM
      </text>
      <text
        x={LARGE_RADIUS}
        y={smallCenter - smallRadius}
        textAnchor="middle"
        dy="50"
        className={`${styles.text} ${styles.white}`}
      >
        {formatLargeNumber(smallValue) || '0K'}
      </text>
    </svg>
  );
};

export default MarketChart;

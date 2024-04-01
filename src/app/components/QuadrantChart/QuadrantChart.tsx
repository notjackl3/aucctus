import { FunctionComponent } from 'react';

import styles from './styles/quadrantChart.module.scss';

export interface QuadrantChartProps {
  chartClass?: string;
  largeValue: number;
  mediumValue: number;
  smallValue: number;
}
// TODO - temp quadrant chart
const QuardantChart: FunctionComponent<QuadrantChartProps> = () => {
  return (
    <div className={styles.quadrantChart}>
      <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <line x1="500" y1="0" x2="500" y2="1000" stroke="#E0E5F2" stroke-width="2" />
        <line x1="0" y1="500" x2="1000" y2="500" stroke="#E0E5F2" stroke-width="2" />

        <line x1="0" y1="200" x2="1000" y2="200" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="0" y1="400" x2="1000" y2="400" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="0" y1="600" x2="1000" y2="600" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="0" y1="800" x2="1000" y2="800" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="200" y1="0" x2="200" y2="1000" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="400" y1="0" x2="400" y2="1000" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="600" y1="0" x2="600" y2="1000" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="800" y1="0" x2="800" y2="1000" stroke="#E0E5F2" stroke-width="1" stroke-dasharray="3,3" />

        <text x="780" y="550" font-family="Inter" font-size="24" fill="#667085">
          High Importance
        </text>
        <text x="520" y="40" font-family="Inter" font-size="24" fill="#667085">
          High Risk
        </text>

        <line x1="500" y1="200" x2="900" y2="200" stroke="purple" stroke-width="2" stroke-dasharray="5,5" />

        <circle cx="300" cy="200" r="22" fill="#FEF0C7" />
        <circle cx="500" cy="400" r="22" fill="#FEF0C7" />
        <circle cx="700" cy="600" r="22" fill="#FEF0C7" />
        <circle cx="300" cy="600" r="22" fill="#FEE4E2" />
        <circle cx="100" cy="400" r="22" fill="#FEE4E2" />
        <circle cx="500" cy="800" r="22" fill="#FEE4E2" />
        <circle cx="700" cy="800" r="22" fill="#D1FADF" />
        <circle cx="900" cy="600" r="22" fill="#D1FADF" />
        <circle cx="700" cy="200" r="22" fill="#DEE7FC" />
        <circle cx="900" cy="200" r="22" fill="#DEE7FC" stroke-width="10" stroke="#4318FF87" />
        <circle cx="800" cy="400" r="22" fill="#FEE4E2" />
        <circle cx="600" cy="800" r="22" fill="#FEE4E2" />
      </svg>
    </div>
  );
};

export default QuardantChart;

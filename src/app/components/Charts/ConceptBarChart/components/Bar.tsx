import { FunctionComponent } from 'react';

import styles from '../styles/conceptBarChart.module.scss';

export interface IChartBarProps {
  width: number;
  height: number;
  chartHeight: number;
  x: number;
  y: number;
  value: number;
  label: string;
  barColorClass: string;
}

const defaultLineProps = {
  stroke: '#E6E6E6',
};

const ChartBar: FunctionComponent<IChartBarProps> = ({
  width,
  height,
  chartHeight,
  x,
  y,
  value,
  label,
  barColorClass,
}) => {
  return (
    <svg
      x={x}
      width={width}
      height={chartHeight}
      viewBox={`0 0 ${width} ${chartHeight}`}
    >
      <text className={styles.headerText} x={'50%'} y={50} textAnchor='middle'>
        {value}
      </text>
      <text className={styles.subLabel} x={'50%'} y={70} textAnchor='middle'>
        {label}
      </text>
      <rect
        y={y}
        x={0}
        width={width}
        height={height}
        className={barColorClass}
      />
      <line
        x1={width}
        y1={chartHeight}
        x2={width}
        y2='0'
        {...defaultLineProps}
      />
    </svg>
  );
};

export default ChartBar;

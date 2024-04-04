import { FunctionComponent, useMemo } from 'react';

import styles from './styles/conceptBarChart.module.scss';
import ChartLongArrow from './components/ChartLongArrow';
import { camelCaseToTitleCase } from '../../../libs/utils';
import ChartShortArrows from './components/ChartShortArrows';

export interface BarData {
  label: string;
  value: number;
  color: string;
}
export interface ConceptBarChartProps {
  barData: BarData[];
  shortArrowPercents: string[];
  longArrowPercents: string[];
}

export const BAR_WIDTH = 170;
export const MAX_BAR_HEIGHT = 200;

export const CHART_WIDTH = 670;
export const CHART_HEIGHT = 327;
export const LABEL_HEIGHT = 127;

const defaultLineProps = {
  stroke: '#E6E6E6',
};

const ConceptBarChart: FunctionComponent<ConceptBarChartProps> = ({
  barData,
  shortArrowPercents,
  longArrowPercents,
}) => {
  const calculateBarYValue = (value: number, maxValue: number): number => {
    const ratio = value / maxValue;
    const originalOffset = LABEL_HEIGHT + MAX_BAR_HEIGHT;
    const barHeight = MAX_BAR_HEIGHT * ratio;
    return originalOffset - barHeight;
  };

  const getMaxChartValue = (barChartData: BarData[]) => {
    return barChartData.reduce((acc, curr) => {
      return curr.value > acc ? curr.value : acc;
    }, 0);
  };

  const chartBars = useMemo(() => {
    const maxChartValue = getMaxChartValue(barData);
    return barData?.map((data, i) => {
      const yCoord = calculateBarYValue(data.value, maxChartValue);

      return (
        <svg
          x={i * BAR_WIDTH}
          width={BAR_WIDTH}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${BAR_WIDTH} ${CHART_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <text className={styles.headerText} key={`main-label-${i}`} x={'50%'} y={50} textAnchor="middle">
            {data.value}
          </text>
          <text className={styles.subLabel} key={`sub-label-${i}`} x={'50%'} y={70} textAnchor="middle">
            {camelCaseToTitleCase(data.label)}
          </text>
          <rect key={`bar-${i}`} y={yCoord} x={0} width="170" height={MAX_BAR_HEIGHT} fill={data.color} />
          <line key={`bar-line-${i}`} x1={BAR_WIDTH} y1={CHART_HEIGHT} x2={BAR_WIDTH} y2="0" {...defaultLineProps} />
        </svg>
      );
    });
  }, [barData]);

  return (
    <div className={styles.conceptBarChart}>
      <svg
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {chartBars}
        <ChartShortArrows percentList={shortArrowPercents} />
        <ChartLongArrow percentList={longArrowPercents} />
      </svg>
    </div>
  );
};

export default ConceptBarChart;

import { FunctionComponent, useMemo } from 'react';

import styles from './quadrantChart.module.scss';
import QuadrantChartGrid from './QuadrantChartGrid';
import QuadrantChartActiveLines from './QuadrantChartActiveLine';
import { getAdjustedCoord } from './utils';

export interface ChartPoint {
  xCoord: number;
  yCoord: number;
  color: string;
  activeColor: string;
  id: string;
}
export interface QuadrantChartProps {
  chartCoordinates: ChartPoint[];
  selectedCoordinate: string;
  yTopLabel: string;
  yBottomLabel: string;
  xRightLabel: string;
  xLeftLabel: string;
}

export const CHART_WIDTH = 2000;
export const CHART_CENTER_WIDTH = 1000;
export const POINT_RADIUS = 48;
export const valueConversionRate = 100;

const defaultTextProps = {
  fill: '#667085',
  fontFamily: 'Inter',
  fontSize: '48',
};

const QuadrantChart: FunctionComponent<QuadrantChartProps> = ({
  chartCoordinates,
  selectedCoordinate,
  yTopLabel,
  yBottomLabel,
  xRightLabel,
  xLeftLabel,
}) => {
  const activeCoordinate = useMemo(
    () => chartCoordinates.find((coordinate) => coordinate.id && coordinate.id === selectedCoordinate),
    [chartCoordinates, selectedCoordinate]
  );

  const chartPoints = useMemo(() => {
    const chartDots = chartCoordinates.map((coordinate, i) => {
      const isCoordSelected = coordinate.id === selectedCoordinate;
      const yCoord = getAdjustedCoord(coordinate.yCoord);
      const xCoord = getAdjustedCoord(coordinate.xCoord);
      return (
        <circle
          key={`coordinate-${i}`}
          id={coordinate.id}
          cx={xCoord}
          cy={yCoord}
          r={POINT_RADIUS}
          fill={coordinate.color}
          strokeWidth={isCoordSelected ? '16' : undefined}
          stroke={coordinate.activeColor}
        />
      );
    });
    // Move the selected circle to the end of the chartDots array so that it will render on top.
    const selectedIndex = chartDots.findIndex((circle) => circle.props.id === selectedCoordinate);
    const removedElement = chartDots.splice(selectedIndex, 1);
    if (removedElement.length) {
      chartDots.push(removedElement[0]);
    }
    return chartDots;
  }, [chartCoordinates, selectedCoordinate]);

  return (
    <div className={styles.quadrantChart}>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
        <QuadrantChartGrid numberGridLines={10} spacing={200} />
        <line
          x1={CHART_CENTER_WIDTH}
          y1="0"
          x2={CHART_CENTER_WIDTH}
          y2={CHART_WIDTH}
          stroke="#E0E5F2"
          strokeWidth="10"
        />
        <line
          x1="0"
          y1={CHART_CENTER_WIDTH}
          x2={CHART_WIDTH}
          y2={CHART_CENTER_WIDTH}
          stroke="#E0E5F2"
          strokeWidth="10"
        />
        {chartPoints}
        <QuadrantChartActiveLines activeChartPoint={activeCoordinate} />
        <text x="1680" y="1120" {...defaultTextProps}>
          {xRightLabel}
        </text>
        <text x="80" y="1120" {...defaultTextProps}>
          {xLeftLabel}
        </text>
        <text x="1020" y="120" {...defaultTextProps}>
          {yTopLabel}
        </text>
        <text x="1020" y="1920" {...defaultTextProps}>
          {yBottomLabel}
        </text>
      </svg>
    </div>
  );
};

export default QuadrantChart;

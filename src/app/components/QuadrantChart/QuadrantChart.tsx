import { FunctionComponent, useMemo } from 'react';

import styles from './styles/quadrantChart.module.scss';

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

type LineDirection = 'horizontal' | 'vertical';

const CHART_WIDTH = 2000;
const CHART_CENTER_WIDTH = 1000;
const POINT_RADIUS = 48;
const valueConversionRate = 100;

const QuardantChart: FunctionComponent<QuadrantChartProps> = ({
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

  const getAdjustedCoord = (coordValue: number) => {
    return CHART_CENTER_WIDTH + coordValue * valueConversionRate;
  };

  const chartPoints = useMemo(() => {
    return chartCoordinates.map((coordinate, i) => {
      const isCoordSelected = coordinate.id === selectedCoordinate;
      const yCoord = getAdjustedCoord(coordinate.yCoord);
      const xCoord = getAdjustedCoord(coordinate.xCoord);
      return (
        <>
          <circle
            key={`coordinate-${i}`}
            cx={yCoord}
            cy={xCoord}
            r={POINT_RADIUS}
            fill={coordinate.color}
            strokeWidth={isCoordSelected ? '16' : undefined}
            stroke={coordinate.activeColor}
          />
        </>
      );
    });
  }, [chartCoordinates, selectedCoordinate]);

  const renderActiveLines = (activeCoordinate?: ChartPoint) => {
    if (!activeCoordinate) {
      return;
    }
    const yCoord = getAdjustedCoord(activeCoordinate.yCoord);
    const xCoord = getAdjustedCoord(activeCoordinate.xCoord);
    return (
      <>
        {/* x-axis-line */}
        <line
          x1={CHART_CENTER_WIDTH}
          y1={xCoord}
          x2={yCoord - POINT_RADIUS}
          y2={xCoord}
          stroke={activeCoordinate.activeColor}
          stroke-width="8"
          stroke-dasharray="10,10"
        />
        {/* y-axis-line */}
        <line
          x1={yCoord}
          y1={CHART_CENTER_WIDTH}
          x2={yCoord}
          y2={xCoord - POINT_RADIUS}
          stroke={activeCoordinate.activeColor}
          stroke-width="8"
          stroke-dasharray="10,10"
        />
      </>
    );
  };

  const renderGridLines = (numberGridLines: number, spacing: number, variant: LineDirection) => {
    const lineList = [];
    for (let i = 0; i <= numberGridLines; i++) {
      const dist = i * spacing;
      if (variant === 'horizontal') {
        lineList.push(
          <line
            key={`horizontal-line-${i}`}
            x1="0"
            y1={dist}
            x2={CHART_WIDTH}
            y2={dist}
            stroke="#7586a9"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        );
      } else if (variant === 'vertical') {
        lineList.push(
          <line
            key={`vertical-line-${i}`}
            x1={dist}
            y1={0}
            x2={dist}
            y2={CHART_WIDTH}
            stroke="#7586a9"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        );
      }
    }
    return lineList;
  };

  return (
    <div className={styles.quadrantChart}>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_WIDTH}`} xmlns="http://www.w3.org/2000/svg">
        {renderGridLines(10, 200, 'horizontal')}
        {renderGridLines(10, 200, 'vertical')}
        <line
          x1={CHART_CENTER_WIDTH}
          y1="0"
          x2={CHART_CENTER_WIDTH}
          y2={CHART_WIDTH}
          stroke="#E0E5F2"
          stroke-width="10"
        />
        <line
          x1="0"
          y1={CHART_CENTER_WIDTH}
          x2={CHART_WIDTH}
          y2={CHART_CENTER_WIDTH}
          stroke="#E0E5F2"
          stroke-width="10"
        />
        {chartPoints}
        {renderActiveLines(activeCoordinate)}
        <text x="1480" y="1120" font-family="Inter" font-size="48" fill="#667085">
          {yTopLabel}
        </text>
        <text x="80" y="1120" font-family="Inter" font-size="48" fill="#667085">
          {yBottomLabel}
        </text>
        <text x="1020" y="120" font-family="Inter" font-size="48" fill="#667085">
          {xRightLabel}
        </text>
        <text x="1020" y="1920" font-family="Inter" font-size="48" fill="#667085">
          {xLeftLabel}
        </text>
      </svg>
    </div>
  );
};

export default QuardantChart;

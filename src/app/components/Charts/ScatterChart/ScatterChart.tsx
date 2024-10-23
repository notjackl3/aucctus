import React from 'react';
import ScatterChartActiveLines from './ScatterChartActiveLine';
import ScatterChartGrid from './ScatterChartGrid';
import { getNormalizedCoord } from './utils';

export interface Point {
  x: number;
  y: number;
  color: string;
  activeColor: string;
  id: string;
}

interface AxisProps {
  upperLabel: string;
  lowerLabel: string;
}

export interface ScatterChartProps {
  data: Point[];
  selectedItem?: string;
  yAxis: AxisProps;
  xAxis: AxisProps;
}

export const CHART_SIZE = 2000;
export const POINT_RADIUS = 48;

const defaultTextProps = {
  fill: '#667085',
  fontFamily: 'Inter',
  fontSize: '48',
};

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  yAxis,
  xAxis,
  selectedItem,
}) => {
  const activePoint = React.useMemo(
    () => data.find((item) => item.id === selectedItem),
    [data, selectedItem],
  );

  const getPoints = React.useCallback((points: Point[], activeId?: string) => {
    if (points.length === 0) return [];

    return points.map((item, i) => {
      const isActive = !!activeId && item.id === activeId;
      const x = getNormalizedCoord(item.x);
      const y = getNormalizedCoord(item.y);
      return (
        <circle
          key={`coordinate-${i}`}
          id={item.id}
          cx={x}
          cy={y}
          r={POINT_RADIUS}
          fill={item.color}
          strokeWidth={isActive ? '16' : undefined}
          stroke={item.activeColor}
        />
      );
    });
  }, []);

  const points = React.useMemo(() => {
    const chartDots = getPoints(data, selectedItem);

    // Move the selected circle to the end of the chartDots array so that it will render on top.
    const selectedIndex = chartDots.findIndex(
      (circle) => circle.props.id === selectedItem,
    );

    const removedElement = chartDots.splice(selectedIndex, 1);
    if (removedElement.length) {
      chartDots.push(removedElement[0]);
    }
    return chartDots;
  }, [data, getPoints, selectedItem]);

  return (
    <div className='flex w-full self-start bg-white'>
      <svg
        className='h-auto max-h-[500px] w-full max-w-full' // Max height is 500px but you can adjust
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        xmlns='http://www.w3.org/2000/svg'
      >
        <ScatterChartGrid numberGridLines={10} spacing={CHART_SIZE / 10} />
        <line
          x1={CHART_SIZE / 2}
          y1='0'
          x2={CHART_SIZE / 2}
          y2={CHART_SIZE}
          stroke='#E0E5F2'
          strokeWidth='10'
        />
        <line
          x1='0'
          y1={CHART_SIZE / 2}
          x2={CHART_SIZE}
          y2={CHART_SIZE / 2}
          stroke='#E0E5F2'
          strokeWidth='10'
        />
        {points}
        <ScatterChartActiveLines activeChartPoint={activePoint} />
        <text
          x={`${CHART_SIZE - 320}`}
          y={`${CHART_SIZE / 2 + 80}`}
          fill='#667085'
          fontFamily='Inter'
          fontSize='48'
        >
          {xAxis.lowerLabel}
        </text>
        <text x='80' y={`${CHART_SIZE / 2 + 80}`} {...defaultTextProps}>
          {xAxis.upperLabel}
        </text>
        <text x={`${CHART_SIZE / 2 - 40}`} y='80' {...defaultTextProps}>
          {yAxis.upperLabel}
        </text>
        <text
          x={`${CHART_SIZE / 2 - 40}`}
          y={`${CHART_SIZE - 80}`}
          {...defaultTextProps}
        >
          {yAxis.lowerLabel}
        </text>
      </svg>
    </div>
  );
};

export default ScatterChart;

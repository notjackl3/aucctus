import { FunctionComponent } from 'react';
import { CHART_SIZE } from './ScatterChart';

type LineDirection = 'horizontal' | 'vertical';

export interface QuadrantChartGridProps {
  numberGridLines: number;
  spacing: number;
}

const defaultLineProps = {
  strokeWidth: '2',
  strokeDasharray: '5,5',
};

const QuadrantChartGrid: FunctionComponent<QuadrantChartGridProps> = ({
  numberGridLines,
  spacing,
}) => {
  const renderGridLines = (
    numberGridLines: number,
    spacing: number,
    variant: LineDirection,
  ) => {
    const lineList = [];
    for (let i = 0; i <= numberGridLines; i++) {
      const dist = i * spacing;
      if (variant === 'horizontal') {
        lineList.push(
          <line
            key={`horizontal-line-${i}`}
            x1='0'
            y1={dist}
            x2={CHART_SIZE}
            y2={dist}
            className='stroke-gray-light-400'
            {...defaultLineProps}
          />,
        );
      } else if (variant === 'vertical') {
        lineList.push(
          <line
            key={`vertical-line-${i}`}
            x1={dist}
            y1={0}
            x2={dist}
            y2={CHART_SIZE}
            className='stroke-gray-light-400'
            {...defaultLineProps}
          />,
        );
      }
    }
    return lineList;
  };

  return (
    <>
      {renderGridLines(numberGridLines, spacing, 'horizontal')}
      {renderGridLines(numberGridLines, spacing, 'vertical')}
    </>
  );
};

export default QuadrantChartGrid;

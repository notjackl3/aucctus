import { FunctionComponent } from 'react';
import { CHART_WIDTH } from './QuadrantChart';

type LineDirection = 'horizontal' | 'vertical';

export interface QuadrantChartGridProps {
  numberGridLines: number;
  spacing: number;
}

const defaultLineProps = {
  stroke: '#7586a9',
  strokeWidth: '2',
  strokeDasharray: '5,5',
};

const QuadrantChartGrid: FunctionComponent<QuadrantChartGridProps> = ({ numberGridLines, spacing }) => {
  const renderGridLines = (numberGridLines: number, spacing: number, variant: LineDirection) => {
    const lineList = [];
    for (let i = 0; i <= numberGridLines; i++) {
      const dist = i * spacing;
      if (variant === 'horizontal') {
        lineList.push(
          <line key={`horizontal-line-${i}`} x1="0" y1={dist} x2={CHART_WIDTH} y2={dist} {...defaultLineProps} />,
        );
      } else if (variant === 'vertical') {
        lineList.push(
          <line key={`vertical-line-${i}`} x1={dist} y1={0} x2={dist} y2={CHART_WIDTH} {...defaultLineProps} />,
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

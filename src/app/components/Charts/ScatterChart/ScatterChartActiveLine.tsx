import { FunctionComponent } from 'react';
import { CHART_SIZE, Point } from './ScatterChart';
import { getActiveAdjustmentDistance, getNormalizedCoord } from './utils';

export interface QuadrantChartActiveLinesProps {
  activeChartPoint?: Point;
}
const defaultLineProps = {
  strokeWidth: '8',
  strokeDasharray: '10,10',
};
const QuadrantChartActiveLines: FunctionComponent<
  QuadrantChartActiveLinesProps
> = ({ activeChartPoint }) => {
  const renderActiveLines = (activeCoordinate?: Point) => {
    if (!activeCoordinate) {
      return;
    }
    const y = getNormalizedCoord(activeCoordinate.y);
    const x = getNormalizedCoord(activeCoordinate.x);
    const xOffset = getActiveAdjustmentDistance(x);
    const yOffset = getActiveAdjustmentDistance(y);
    return (
      <>
        {/* x-axis-line */}
        <line
          x1={CHART_SIZE / 2}
          y1={y}
          x2={x + xOffset}
          y2={y}
          stroke={activeCoordinate.activeColor}
          {...defaultLineProps}
        />
        {/* y-axis-line */}
        <line
          x1={x}
          y1={CHART_SIZE / 2}
          x2={x}
          y2={y + yOffset}
          stroke={activeCoordinate.activeColor}
          {...defaultLineProps}
        />
      </>
    );
  };

  return <>{renderActiveLines(activeChartPoint)}</>;
};

export default QuadrantChartActiveLines;

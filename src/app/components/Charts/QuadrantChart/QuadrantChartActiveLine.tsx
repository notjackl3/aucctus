import { FunctionComponent } from 'react';
import { CHART_CENTER_WIDTH, ChartPoint } from './QuadrantChart';
import { getActiveAdjustmentDistance, getAdjustedCoord } from './utils';

export interface QuadrantChartActiveLinesProps {
  activeChartPoint?: ChartPoint;
}
const defaultLineProps = {
  strokeWidth: '8',
  strokeDasharray: '10,10',
};
const QuadrantChartActiveLines: FunctionComponent<
  QuadrantChartActiveLinesProps
> = ({ activeChartPoint }) => {
  const renderActiveLines = (activeCoordinate?: ChartPoint) => {
    if (!activeCoordinate) {
      return;
    }
    const yCoord = getAdjustedCoord(activeCoordinate.yCoord);
    const xCoord = getAdjustedCoord(activeCoordinate.xCoord);
    const xAdjust = getActiveAdjustmentDistance(xCoord);
    const yAdjust = getActiveAdjustmentDistance(yCoord);
    return (
      <>
        {/* x-axis-line */}
        <line
          x1={CHART_CENTER_WIDTH}
          y1={yCoord}
          x2={xCoord + xAdjust}
          y2={yCoord}
          stroke={activeCoordinate.activeColor}
          {...defaultLineProps}
        />
        {/* y-axis-line */}
        <line
          x1={xCoord}
          y1={CHART_CENTER_WIDTH}
          x2={xCoord}
          y2={yCoord + yAdjust}
          stroke={activeCoordinate.activeColor}
          {...defaultLineProps}
        />
      </>
    );
  };

  return <>{renderActiveLines(activeChartPoint)}</>;
};

export default QuadrantChartActiveLines;

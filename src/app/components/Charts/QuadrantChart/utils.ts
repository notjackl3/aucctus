import { CHART_CENTER_WIDTH, POINT_RADIUS, valueConversionRate } from './QuadrantChart';

export const getAdjustedCoord = (coordValue: number) => {
  return CHART_CENTER_WIDTH + coordValue * valueConversionRate;
};

export const getActiveAdjustmentDistance = (coord: number) => {
  if (coord === CHART_CENTER_WIDTH) {
    return 0;
  } else {
    return coord > CHART_CENTER_WIDTH ? -POINT_RADIUS : POINT_RADIUS;
  }
};

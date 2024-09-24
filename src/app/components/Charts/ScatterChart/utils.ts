import analytics from '@libs/analytics';
import {
  CHART_CENTER_WIDTH,
  POINT_RADIUS,
  valueConversionRate,
} from './ScatterChart';

export const getNormalizedCoord = (value: number) => {
  const normalizedCoord = CHART_CENTER_WIDTH + value * valueConversionRate;

  if (isNaN(normalizedCoord)) {
    analytics.debug('Coordinates value found as NaN!');
    return 0;
  }

  return normalizedCoord;
};

export const getActiveAdjustmentDistance = (coord: number) => {
  if (coord === CHART_CENTER_WIDTH) {
    return 0;
  } else {
    return coord > CHART_CENTER_WIDTH ? -POINT_RADIUS : POINT_RADIUS;
  }
};

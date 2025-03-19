import analytics from '@libs/telemetry';
import { CHART_SIZE, POINT_RADIUS } from './ScatterChart';

export const getNormalizedCoord = (value: number) => {
  const normalizedCoord = CHART_SIZE - (value / 100) * CHART_SIZE;

  if (isNaN(normalizedCoord)) {
    analytics.debug('Coordinates value found as NaN!');
    return 0;
  }

  return normalizedCoord;
};

export const getActiveAdjustmentDistance = (coord: number) => {
  if (coord === CHART_SIZE / 2) {
    return 0;
  } else {
    return coord > CHART_SIZE / 2 ? -POINT_RADIUS : POINT_RADIUS;
  }
};

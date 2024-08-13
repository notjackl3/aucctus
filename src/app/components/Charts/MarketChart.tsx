import { FunctionComponent } from 'react';

import utils from '@libs/utils';
import classname from 'classnames';
export interface MarketChartProps {
  className?: string;
  tam: number;
  sam: number;
  som: number;
}

const MarketChart: FunctionComponent<MarketChartProps> = ({ tam, sam, som, className = '' }) => {
  const LARGE_RADIUS = 221;

  const mediumRatio = getMediumRatio(sam, tam);
  const smallRatio = getSmallRatio(som, tam);

  const largeArea = Math.round(Math.PI * LARGE_RADIUS * LARGE_RADIUS);
  const mediumArea = Math.round(largeArea * mediumRatio);
  const smallArea = Math.round(largeArea * smallRatio);
  const mediumRadius = Math.round(Math.sqrt(mediumArea / Math.PI));
  const smallRadius = Math.round(Math.sqrt(smallArea / Math.PI));

  const mediumCenter = LARGE_RADIUS * 2 - mediumRadius;
  const smallCenter = LARGE_RADIUS * 2 - smallRadius;

  const textClass = (isWhite: boolean = false) =>
    classname('flex flex-col text-xl font-normal', {
      'fill-black': !isWhite,
      'fill-white': isWhite,
    });

  return (
    <svg viewBox='0 0 442 442' fill='black' className={classname('flex', className)}>
      <circle className='fill-primary-250' fill='#c9bdff' cx={LARGE_RADIUS} cy={LARGE_RADIUS} r={LARGE_RADIUS}></circle>
      <circle className='fill-primary-450' fill='#937bff' cx={LARGE_RADIUS} cy={mediumCenter} r={mediumRadius}></circle>
      <circle className='fill-primary-600' fill='' cx={LARGE_RADIUS} cy={smallCenter} r={smallRadius}></circle>
      <text x={LARGE_RADIUS} y={LARGE_RADIUS} textAnchor='middle' dy='-151' className={textClass()}>
        TAM
      </text>
      <text x={LARGE_RADIUS} y={LARGE_RADIUS} textAnchor='middle' dy='-131' className={textClass()}>
        {utils.number.formatter.format(tam) || '0M'}
      </text>
      <text x={LARGE_RADIUS} y={mediumCenter - mediumRadius} textAnchor='middle' dy='30' className={textClass()}>
        SAM
      </text>
      <text x={LARGE_RADIUS} y={mediumCenter - mediumRadius} textAnchor='middle' dy='50' className={textClass()}>
        {utils.number.formatter.format(sam) || '0K'}
      </text>
      <text x={LARGE_RADIUS} y={smallCenter - smallRadius} textAnchor='middle' dy='30' className={textClass(true)}>
        SOM
      </text>
      <text x={LARGE_RADIUS} y={smallCenter - smallRadius} textAnchor='middle' dy='50' className={textClass(true)}>
        {utils.number.formatter.format(som) || '0K'}
      </text>
    </svg>
  );
};

/**
 * Calculates the medium ratio by dividing the medium value by the large value.
 * The result is clamped between 0.4 and 0.6.
 *
 * @param mediumValue - The medium value.
 * @param largeValue - The large value.
 * @returns The clamped medium ratio, ensuring it is between 0.4 and 0.6.
 */
const getMediumRatio = (mediumValue: number, largeValue: number) =>
  utils.number.clamp(mediumValue / largeValue, 0.4, 0.6);

/**
 * Calculates the small ratio by dividing the small value by the large value.
 * The result is clamped between 0.05 and 0.25.
 *
 * @param smallValue - The small value.
 * @param largeValue - The large value.
 * @returns The clamped small ratio, ensuring it is between 0.05 and 0.25.
 */
const getSmallRatio = (smallValue: number, largeValue: number) =>
  utils.number.clamp(smallValue / largeValue, 0.05, 0.25);

export default MarketChart;

import { Icon } from '@components';
import React from 'react';

/**
 * Props for PriorityIndicator component.
 * @param textColorClass Tailwind or Aucctus class for the text color
 * @param lineColorClass Tailwind class for the vertical line color
 * @param highLabel Label for the top of the scale (default: "High Priority")
 * @param lowLabel Label for the bottom of the scale (default: "Low Priority")
 */
interface PriorityIndicatorProps {
  textColorClass?: string;
  lineColorClass?: string;
  highLabel?: string;
  lowLabel?: string;
}

/**
 * PriorityIndicator displays a vertical bar with High/Low Priority labels and arrows.
 * Used in JobsToBeDone to visually indicate job priority order.
 */
const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  textColorClass = 'aucctus-text-brand-primary',
  lineColorClass = 'bg-gradient-to-b from-blue-500/80 to-blue-500/20',
  highLabel = 'High Priority',
  lowLabel = 'Low Priority',
}) => (
  <div className='mb-4 mr-2 mt-1 flex w-8 flex-shrink-0 flex-col items-center'>
    <div className='flex flex-col items-center'>
      <span
        className={`${textColorClass} aucctus-text-xs-semibold`}
        style={{
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg)',
        }}
      >
        {highLabel}
      </span>
      <div className='h-3'></div>
      <Icon
        variant='arrowdown'
        height={12}
        width={12}
        className='aucctus-stroke-secondary'
      />
    </div>
    <div className={`my-1 h-full w-px flex-grow ${lineColorClass}`}></div>
    <div className='flex flex-col items-center'>
      <Icon
        variant='arrowdown'
        height={12}
        width={12}
        className='aucctus-stroke-tertiary opacity-20'
      />
      <div className='h-3'></div>
      <span
        className={`${textColorClass} aucctus-text-xs`}
        style={{
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg)',
        }}
      >
        {lowLabel}
      </span>
    </div>
  </div>
);

export default React.memo(PriorityIndicator);

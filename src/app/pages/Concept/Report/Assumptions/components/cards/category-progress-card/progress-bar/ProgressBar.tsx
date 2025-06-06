import React from 'react';
import { AssumptionCategory } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import StandardProgressBar from './StandardProgressBar';
import InvalidatedProgressBar from './InvalidatedProgressBar';

interface ProgressBarProps {
  category: AssumptionCategory;
  percentage: number; // Validation percentage from assumption
  isInvalidated?: boolean;
  className?: string;
  width: number; // Fixed pixel width for the progress bar
}

/**
 * ProgressBar component that displays the progress of an assumption category
 * @param category - The assumption category (desirability, viability, feasibility, adaptability)
 * @param percentage - The validation percentage (0-100)
 * @param isInvalidated - Whether the assumption is invalidated
 * @param className - Additional CSS classes
 * @param width - Fixed pixel width for the progress bar (e.g., 128px)
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  category,
  percentage,
  isInvalidated = false,
  className,
  width,
}) => {
  // Determine if the category should be shown as validated based on progressValue
  const isValidated = percentage >= 70;

  // Validation threshold value - 70%
  const thresholdValue = 70;

  return (
    <div
      className={cn(
        'relative h-6 overflow-hidden rounded-md bg-transparent',
        className,
      )}
      style={{ width: `${width}px` }}
    >
      {!isInvalidated ? (
        <StandardProgressBar
          category={category}
          effectiveProgress={percentage}
          progressValue={percentage}
          isValidated={isValidated}
          thresholdValue={thresholdValue}
          width={width}
        />
      ) : (
        <InvalidatedProgressBar
          progressValue={percentage}
          thresholdValue={thresholdValue}
          width={width}
          category={category}
        />
      )}
    </div>
  );
};

export default ProgressBar;

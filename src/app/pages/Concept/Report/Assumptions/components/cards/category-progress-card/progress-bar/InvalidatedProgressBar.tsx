import React from 'react';
import { cn } from '@libs/utils/react';
import ThresholdMarker from './ThresholdMarker';
import { AssumptionCategory } from '@libs/api/types';
import {
  INVALIDATED_COLORS,
  COMMON_COLORS,
} from '../../../../constants/categoryColors';
import { X } from 'lucide-react';

// Inline getProgressBarColors utility
export const getProgressBarColors = (
  category: AssumptionCategory,
  isInvalidated = false,
) => {
  if (isInvalidated) {
    return {
      progressBarColor: 'bg-gray-300', // More visible gray
      progressBarLightColor: 'bg-gray-200/30',
      progressBarDarkColor: 'bg-gray-400',
      bgColor: 'bg-gray-100', // Default background
    };
  }
  switch (category) {
    case 'desirability':
      return {
        progressBarColor: 'bg-pink-500', // Bright pink for filled progress
        progressBarLightColor: 'bg-pink-300/30',
        progressBarDarkColor: 'bg-pink-600',
        bgColor: 'bg-pink-50', // Light pink background
      };
    case 'feasibility':
      return {
        progressBarColor: 'bg-blue-500', // Bright blue for filled progress
        progressBarLightColor: 'bg-blue-300/30',
        progressBarDarkColor: 'bg-blue-600',
        bgColor: 'bg-blue-50', // Light blue background
      };
    case 'viability':
      return {
        progressBarColor: 'bg-purple-500', // Bright purple for filled progress
        progressBarLightColor: 'bg-purple-300/30',
        progressBarDarkColor: 'bg-purple-600',
        bgColor: 'bg-purple-50', // Light purple background
      };
    case 'adaptability':
      return {
        progressBarColor: 'bg-orange-500', // Bright orange for filled progress
        progressBarLightColor: 'bg-orange-300/30',
        progressBarDarkColor: 'bg-orange-600',
        bgColor: 'bg-orange-50', // Light orange background
      };
    default:
      return {
        progressBarColor: 'bg-gray-500',
        progressBarLightColor: 'bg-gray-300/30',
        progressBarDarkColor: 'bg-gray-600',
        bgColor: 'bg-gray-100', // Default background
      };
  }
};

interface InvalidatedProgressBarProps {
  progressValue: number;
  thresholdValue: number;
  width: number; // Fixed pixel width for progress calculations
  category?: AssumptionCategory; // Optional category for background color
}

/**
 * InvalidatedProgressBar component that displays a progress bar in an invalidated state
 * @param progressValue - The current progress value (0-100)
 * @param thresholdValue - The threshold value that indicates validation requirement
 * @param width - Fixed pixel width for the progress bar
 * @param category - Optional category used for background color
 */
const InvalidatedProgressBar: React.FC<InvalidatedProgressBarProps> = ({
  progressValue,
  thresholdValue,
  width,
}) => {
  // Get colors from centralized constants
  const {
    progressBar: invalidProgressBar,
    progressBarDark: invalidProgressBarDark,
  } = INVALIDATED_COLORS;

  const emptyProgressBar = COMMON_COLORS.emptyProgressBar;

  return (
    <>
      {/* Show neutralized progress bar */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full transition-all duration-200',
          invalidProgressBar,
          'rounded-l-md hover:brightness-110',
        )}
        style={{
          width: `${(Math.min(progressValue, thresholdValue) * width) / 100}px`,
        }}
      />

      {/* Section at threshold - ensure no rounded corner to meet the threshold line exactly */}
      {progressValue > thresholdValue && (
        <div
          className={cn(
            'absolute h-full transition-all duration-200',
            invalidProgressBarDark,
            'hover:brightness-110',
          )}
          style={{
            left: `${(thresholdValue * width) / 100}px`,
            width: `${((progressValue - thresholdValue) * width) / 100}px`,
            borderRadius: progressValue >= 100 ? '0 0.375rem 0.375rem 0' : '0',
          }}
        />
      )}

      {/* Empty section for remaining progress - always rounded on right */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full transition-all duration-200',
          emptyProgressBar,
          'rounded-r-md hover:brightness-110',
        )}
        style={{
          width: `${(Math.max(0, 100 - progressValue) * width) / 100}px`,
        }}
      />

      {/* Threshold marker still visible even for invalidated state */}
      <ThresholdMarker position={thresholdValue} width={width} />

      {/* Red X overlay to indicate invalidation */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='rounded-full bg-red-500 p-0.5'>
          <X className='aucctus-stroke-white h-3 w-3' strokeWidth={3} />
        </div>
      </div>
    </>
  );
};

export default InvalidatedProgressBar;

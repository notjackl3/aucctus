import React, { useState } from 'react';
import { Icon } from '@components';
import { AssumptionCategory } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import ThresholdMarker from './ThresholdMarker';
import { getCategoryColors } from '../../../../constants/categoryColors';

interface StandardProgressBarProps {
  category: AssumptionCategory;
  effectiveProgress: number;
  progressValue: number;
  isValidated: boolean;
  thresholdValue: number;
  width: number; // Fixed pixel width for progress calculations
}

const StandardProgressBar: React.FC<StandardProgressBarProps> = ({
  category,
  effectiveProgress,
  isValidated,
  thresholdValue,
  width,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Get colors from centralized source
  const categoryColors = getCategoryColors(category);

  const {
    progressBar: progressBarColor,
    progressBarLight: progressBarLightColor,
    progressBarDark: progressBarDarkColor,
  } = categoryColors;

  const getHoverClass = (section: string) => {
    if (hoveredSection === section) {
      if (section === 'filled') {
        return 'brightness-110';
      } else if (section === 'remaining') {
        return 'brightness-125';
      } else if (section === 'exceeded') {
        return 'brightness-110';
      } else {
        return 'brightness-110';
      }
    }
    return '';
  };

  return (
    <>
      {/* Progress bar - main filled section */}
      <div
        className={cn(
          'absolute left-0 top-0 h-full transition-all duration-200',
          progressBarColor,
          effectiveProgress > 0 ? 'rounded-l-md' : 'rounded-md',
          getHoverClass('filled'),
        )}
        style={{
          width: `${(Math.min(effectiveProgress, thresholdValue) * width) / 100}px`,
        }}
        onMouseEnter={() => setHoveredSection('filled')}
        onMouseLeave={() => setHoveredSection(null)}
      />

      {/* Remaining section with lighter opacity - no rounded corner to meet threshold marker exactly */}
      <div
        className={cn(
          'absolute h-full transition-all duration-200',
          progressBarLightColor,
          effectiveProgress >= thresholdValue ? 'hidden' : '',
          getHoverClass('remaining'),
        )}
        style={{
          left: `${(Math.min(effectiveProgress, thresholdValue) * width) / 100}px`,
          width: `${(Math.max(0, thresholdValue - effectiveProgress) * width) / 100}px`,
        }}
        onMouseEnter={() => setHoveredSection('remaining')}
        onMouseLeave={() => setHoveredSection(null)}
      />

      {/* Threshold marker at threshold value */}
      <ThresholdMarker position={thresholdValue} width={width} />

      {/* Progress bar - section after threshold with rounded-r-md */}
      {effectiveProgress > thresholdValue && (
        <div
          className={cn(
            'absolute h-full transition-all duration-200',
            progressBarDarkColor,
            'rounded-r-md',
            getHoverClass('exceeded'),
          )}
          style={{
            left: `${(thresholdValue * width) / 100}px`,
            width: `${((effectiveProgress - thresholdValue) * width) / 100}px`,
          }}
          onMouseEnter={() => setHoveredSection('exceeded')}
          onMouseLeave={() => setHoveredSection(null)}
        />
      )}

      {/* Empty section for full 100% - always rounded on right */}
      {effectiveProgress < 100 && (
        <div
          className={cn(
            'absolute right-0 top-0 h-full rounded-r-md bg-gray-100 transition-all duration-200',
            getHoverClass('empty'),
          )}
          style={{
            width: `${(Math.max(0, 100 - Math.max(effectiveProgress, thresholdValue)) * width) / 100}px`,
          }}
          onMouseEnter={() => setHoveredSection('empty')}
          onMouseLeave={() => setHoveredSection(null)}
        />
      )}

      {/* For Validated state - add a checkmark */}
      {isValidated && (
        <div className='absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full bg-green-500 p-0.5'>
          <Icon
            variant='check'
            className='aucctus-stroke-white h-3 w-3'
            strokeWidth={3}
          />
        </div>
      )}
    </>
  );
};

export default StandardProgressBar;

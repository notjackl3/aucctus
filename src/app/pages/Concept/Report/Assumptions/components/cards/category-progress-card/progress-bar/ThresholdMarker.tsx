import React from 'react';
import { COMMON_COLORS } from '../../../../constants/categoryColors';

interface ThresholdMarkerProps {
  position: number; // Position in percentage (0-100)
  width: number; // Fixed pixel width for the progress bar
}

const ThresholdMarker: React.FC<ThresholdMarkerProps> = ({
  position,
  width,
}) => {
  // Calculate position in pixels
  const pixelPosition = (position * width) / 100;

  return (
    <div
      className='absolute z-10'
      style={{ left: `${pixelPosition}px`, top: '0' }}
    >
      <div
        className={`h-6 w-0 w-0.5 p-0 ${COMMON_COLORS.thresholdMarker}`}
      ></div>
    </div>
  );
};

export default ThresholdMarker;

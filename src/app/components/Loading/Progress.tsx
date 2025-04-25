import React from 'react';
import { cn } from '@libs/utils/react'; // Import cn from the correct file

interface ProgressProps {
  progress: number; // The current progress value (0-100).
  className?: string;
}

/**
 * Displays an animated progress bar.
 */
const Progress: React.FC<ProgressProps> = ({ progress, className }) => {
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={cn(
        'aucctus-bg-tertiary relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      role='progressbar'
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className='aucctus-bg-brand-solid h-full transition-all duration-300 ease-in-out'
        style={{ width: `${normalizedProgress}%` }}
      />
    </div>
  );
};

export default Progress;

import { ConceptStatus } from '@libs/api/types';
import {
  getConceptStatusDisplayName,
  getConceptStatusStyles,
} from '@libs/utils/concepts';
import React from 'react';
import { cn } from '@libs/utils/react';

interface IStatusProps {
  value: ConceptStatus;
}

const Status: React.FC<IStatusProps> = ({ value }) => {
  const style = getConceptStatusStyles(value);

  // Extract color type from the background class (e.g., "bg-blue-25" → "blue")
  const bgColorMatch = style.bg.match(/bg-([a-z]+)-\d+/);
  const colorType = bgColorMatch ? bgColorMatch[1] : 'gray';

  // Create border class with a lighter shade
  const borderClass = `border border-${colorType}-100`;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full px-2 py-1',
        'w-fit max-w-[160px]',
        style.bg,
        borderClass,
      )}
    >
      <span
        className={cn(
          'font-inter text-center text-xs font-medium capitalize',
          'overflow-hidden truncate',
          style.text,
        )}
      >
        {getConceptStatusDisplayName(value)}
      </span>
    </div>
  );
};

export default Status;

import { ConceptStatus } from '@libs/api/types';
import { getConceptStatusStyles } from '@libs/utils/concepts';
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
        'flex items-center justify-center rounded-full px-4 py-1.5',
        'w-fit',
        style.bg,
        borderClass,
      )}
    >
      <span
        className={cn(
          'font-inter h-[20px] text-center text-sm font-medium capitalize leading-[20px]',
          style.text,
        )}
      >
        {value}
      </span>
    </div>
  );
};

export default Status;

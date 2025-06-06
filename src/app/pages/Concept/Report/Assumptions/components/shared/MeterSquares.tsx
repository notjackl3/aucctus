import { cn } from '@libs/utils/react';
import React from 'react';

interface MeterSquaresProps {
  value: number; // The value is used by parent to determine the level, not directly here
  blockColors: string[]; // Array of colors that already represent the correct state
}

const MeterSquares: React.FC<MeterSquaresProps> = ({ blockColors }) => {
  // blockColors already contains the correct colors for the current level
  // (e.g., ['bg-green-500', 'bg-green-500', 'bg-green-500'] for high level)
  return (
    <div className='flex gap-0.5'>
      {blockColors.map((blockColor, index) => (
        <div key={index} className={cn('h-4 w-4 rounded-sm', blockColor)} />
      ))}
    </div>
  );
};

export default MeterSquares;

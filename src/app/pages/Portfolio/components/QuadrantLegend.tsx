/**
 * Quadrant Legend Component
 *
 * Shows the meaning of each quadrant in the priority matrix.
 */

import React from 'react';
import { cn } from '@libs/utils/react';

const QuadrantLegend: React.FC = () => {
  const quadrants = [
    {
      color: 'bg-green-500',
      label: 'High Priority',
      description: 'High opportunity, low risk',
    },
    {
      color: 'bg-yellow-500',
      label: 'Consider',
      description: 'Mixed opportunity/risk',
    },
    {
      color: 'bg-red-500',
      label: 'Low Priority',
      description: 'Low opportunity, high risk',
    },
  ];

  return (
    <div className='flex items-center gap-4'>
      {quadrants.map((quadrant) => (
        <div key={quadrant.label} className='flex items-center gap-2'>
          <div className={cn('h-3 w-3 rounded-full', quadrant.color)} />
          <span className='aucctus-text-xs aucctus-text-secondary'>
            {quadrant.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default QuadrantLegend;

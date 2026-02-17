/**
 * Empty state component when no scoring data is available
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';
interface EmptyScoringStateProps {
  message?: string;
}

const EmptyScoringState: React.FC<EmptyScoringStateProps> = ({
  message = 'No scoring data available yet.',
}) => (
  <div className='aucctus-bg-secondary aucctus-border-secondary rounded-xl border p-8 text-center'>
    <BarChart3 className='aucctus-stroke-tertiary mx-auto mb-3 h-10 w-10' />
    <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
      No Scoring Data Yet
    </h4>
    <p className='aucctus-text-sm aucctus-text-tertiary'>{message}</p>
  </div>
);

export default EmptyScoringState;

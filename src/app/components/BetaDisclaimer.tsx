import { cn } from '@libs/utils/react';
import React from 'react';

// Note: there is also a Beta Badge component in the Badge folder with out the text and uses a different styling

interface BetaDisclaimerProps {
  className?: string;
}

const BetaDisclaimer: React.FC<BetaDisclaimerProps> = ({ className }) => {
  return (
    <div className={cn('flex w-full flex-row gap-2 self-stretch', className)}>
      <span className='aucctus-text-xs-medium aucctus-text-white'>
        <span className='aucctus-text-xs-bold aucctus-text-white mr-2 rounded-md border border-white p-1.5'>
          BETA
        </span>
        This is an early feature and may make mistakes.
      </span>
    </div>
  );
};

export default BetaDisclaimer;

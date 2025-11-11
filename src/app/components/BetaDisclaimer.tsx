import { cn } from '@libs/utils/react';
import React from 'react';

// Note: there is also a Beta Badge component in the Badge folder with out the text and uses a different styling

interface BetaDisclaimerProps {
  className?: string;
  darkMode?: boolean;
}

const BetaDisclaimer: React.FC<BetaDisclaimerProps> = ({
  className,
  darkMode = false,
}) => {
  return (
    <div
      className={cn(
        'flex flex w-full flex-row items-center gap-2 self-stretch',
        className,
      )}
    >
      <span
        className={cn(
          'aucctus-text-xs-medium flex items-center',
          darkMode ? 'aucctus-text-secondary' : 'aucctus-text-white',
        )}
      >
        <span
          className={cn(
            'aucctus-text-xs-bold mr-2 rounded-md border p-1.5',
            darkMode
              ? 'aucctus-border-primary aucctus-text-secondary'
              : 'aucctus-text-white border-white',
          )}
        >
          BETA
        </span>
        This is an early feature and may make mistakes.
      </span>
    </div>
  );
};

export default BetaDisclaimer;

import React from 'react';

// Note: there is also a Beta Badge component in the Badge folder with out the text and uses a different styling

interface BetaDisclaimerProps {}

const BetaDisclaimer: React.FC<BetaDisclaimerProps> = ({}) => {
  return (
    <div className='flex w-full flex-row items-center justify-center gap-2 self-stretch'>
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

import { Loading } from '@components';
import React from 'react';

interface ConceptTableCardProps {
  footer?: React.ReactNode;
  isLoading: boolean;
  children: React.ReactNode;
}

const ConceptTableCard: React.FC<ConceptTableCardProps> = ({
  footer,
  children,
  isLoading,
}) => {
  return (
    <div className='aucctus-border-secondary aucctus-bg-primary  inline-flex h-auto min-h-24 w-full flex-col items-start justify-between rounded-lg border'>
      <div className='inline-flex w-full flex-col items-start justify-start'>
        {/* Content */}
        {isLoading ? (
          // Loading Indicator
          <div className='flex h-full w-full items-center justify-center self-stretch align-middle'>
            <Loading />
          </div>
        ) : (
          // Table
          <div className='max-h-[calc(100vh-360px)] w-full overflow-y-auto'>
            {children}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className='aucctus-border-secondary w-full border-t'>{footer}</div>
    </div>
  );
};

export default ConceptTableCard;

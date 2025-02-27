import { Loading } from '@components';
import React from 'react';

interface ConceptTableCardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isLoading: boolean;
  children: React.ReactNode;
}

const ConceptTableCard: React.FC<ConceptTableCardProps> = ({
  header,
  footer,
  children,
  isLoading,
}) => {
  return (
    <div className='aucctus-border-secondary aucctus-bg-primary  inline-flex h-auto min-h-96 w-full flex-col items-start justify-between rounded-xl border shadow-sm'>
      <div className='inline-flex w-full flex-col items-start justify-start'>
        {/* Header */}
        <div className='aucctus-border-secondary inline-flex h-[60px] w-full items-center justify-between rounded-t-xl border-b px-6 py-3'>
          {header}
        </div>
        {/* Content */}
        {isLoading ? (
          // Loading Indicator
          <div className='flex h-full w-full items-center justify-center self-stretch align-middle'>
            <Loading />
          </div>
        ) : (
          // Table
          <div className='max-h-[calc(100vh-360px)] w-full overflow-y-scroll'>
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

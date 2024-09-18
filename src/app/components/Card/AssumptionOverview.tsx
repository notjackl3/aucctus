import React from 'react';

interface AssumptionOverviewProps {
  header: string;
  body?: React.ReactNode;
  footer: React.ReactNode;
}

const AssumptionOverview: React.FC<AssumptionOverviewProps> = ({
  header,
  body,
  footer,
}) => {
  return (
    <div className='inline-flex h-[119px] flex-col items-start justify-start gap-1.5 rounded-lg border border-gray-200 bg-white p-6'>
      <div className='self-stretch text-xs font-medium text-slate-300'>
        {header}
      </div>
      <div className='self-stretch text-2xl font-semibold text-indigo-900'>
        {body ? body : '--'}
      </div>
      <div className='self-stretch text-xs font-semibold text-slate-500'>
        {footer}
      </div>
    </div>
  );
};

export default AssumptionOverview;

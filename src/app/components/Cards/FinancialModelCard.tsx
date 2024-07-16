import React from 'react';

interface IFinancialModelCard {
  heading: string;
  value: string;
  content: string;
}

const FinancialModelCard: React.FC<IFinancialModelCard> = ({ heading, value, content }) => {
  return (
    <div className='w-min-80 inline-flex h-auto flex-col items-start justify-start gap-2.5 self-stretch rounded-xl border border-slate-200 bg-white p-5 pb-8'>
      <div className='inline-flex items-start justify-start gap-1.5 self-stretch'>
        <span className='shrink grow basis-0 text-sm font-bold text-slate-600 '>{heading}</span>
      </div>
      <div className='inline-flex items-center justify-start gap-3 self-stretch border-b border-gray-300'>
        <h3 className='text-2xl font-bold leading-loose text-indigo-900'>{value}</h3>
        {/* <div className="Button w-6 h-6 p-2 bg-violet-50 rounded border border-violet-50 justify-center items-center gap-2 flex">
            <div className="w-3 h-3 relative" />
          </div> */}
      </div>

      <p className='self-stretch text-base font-medium text-gray-500'>{content}</p>
    </div>
  );
};

export default FinancialModelCard;

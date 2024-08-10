import Icon from '@components/Icons';
import React from 'react';

interface IFinancialModelCard {
  heading: string;
  value: string;
  content: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const FinancialModelCard: React.FC<IFinancialModelCard> = ({ heading, value, content, onClick }) => {
  return (
    <div className='inline-flex h-auto max-h-fit w-full min-w-80 max-w-96 flex-col items-start justify-start gap-2.5 self-stretch rounded-xl border border-slate-200 bg-white p-5 pb-8'>
      <div className='inline-flex items-start justify-start gap-1.5 self-stretch'>
        <span className='shrink grow basis-0 text-sm font-bold text-slate-600 '>{heading}</span>
      </div>
      <div className='inline-flex items-center justify-start gap-3 self-stretch border-b border-gray-300 pb-3'>
        <h3 className='text-lg font-bold leading-loose text-indigo-900'>{value}</h3>
        <button
          className='btn btn-primary-light btn-no-border h-8 w-8 border-violet-50 p-0 [&>svg>use]:stroke-primary-600'
          onClick={onClick}
        >
          <Icon variant='book-open' strokeWidth={6} />
        </button>
      </div>

      <p className='self-stretch text-base font-medium text-gray-500'>{content}</p>
    </div>
  );
};

export default FinancialModelCard;

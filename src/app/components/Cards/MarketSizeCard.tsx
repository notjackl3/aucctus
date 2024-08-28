import Icon from '@components/Icon';
import utils from '@libs/utils';
import React from 'react';

interface IMarketSizeCard {
  title: string;
  value: string;
  descriptor: string;
  assumptions: string[];
  // TODO: Add tail wind class typings
  bulletColor: string;

  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const MarketSizeCard: React.FC<IMarketSizeCard> = ({
  title,
  value,
  descriptor,
  assumptions,
  bulletColor = 'bg-violet-300',
  onClick,
}) => {
  return (
    <div className='inline-flex w-96 flex-col items-start justify-start rounded-xl border border-slate-200 bg-white shadow'>
      <div className='flex h-28 flex-col items-start justify-start gap-5 self-stretch rounded-t-xl border-b border-gray-300 bg-white pt-5'>
        <div className='inline-flex items-center justify-center gap-2 self-stretch px-6'>
          <div className='flex items-center justify-start gap-2.5 pr-2.5'>
            <div className={`h-5 w-5 rounded-full ${bulletColor}`} />
          </div>
          <div className='w-56 text-base font-medium leading-normal text-indigo-900'>
            {title}
          </div>
          <div className='flex flex-col items-end justify-center gap-2.5'>
            <div className='inline-flex flex-col items-end justify-center'>
              <p className='text-base font-medium leading-normal text-indigo-900'>
                {value}
              </p>
              <p className='text-xs font-normal leading-none text-gray-500'>
                {descriptor}
              </p>
            </div>
            <button
              className='btn btn-primary-light btn-no-border h-8 w-8 border-violet-50 p-0 [&>svg>use]:stroke-primary-600'
              onClick={onClick}
            >
              <Icon variant='book-open' strokeWidth={6} />
            </button>
          </div>
        </div>
      </div>
      <div className='flex shrink grow basis-0 flex-col items-start justify-start self-stretch'>
        {assumptions.map((assumption) => (
          <div
            key={utils.string.generateRandomString(5)}
            className='inline-flex items-center justify-start gap-5 self-stretch border-b border-slate-200 bg-neutral-50 px-6 py-3 last:rounded-b-xl'
          >
            <p className='w-full self-stretch text-wrap text-sm font-medium leading-tight text-indigo-900'>
              {assumption}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSizeCard;

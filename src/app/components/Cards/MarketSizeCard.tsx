import { generateRandomString } from '@libs/utils';
import React from 'react';

interface IMarketSizeCard {
  title: string;
  value: string;
  descriptor: string;
  assumptions: string[];
  // TODO: Add tail wind class typings
  bulletColor: string;
}

const MarketSizeCard: React.FC<IMarketSizeCard> = ({
  title,
  value,
  descriptor,
  assumptions,
  bulletColor = 'bg-violet-300',
}) => {
  return (
    <div className='inline-flex w-96 flex-col items-start justify-start rounded-xl border border-slate-200 bg-white shadow'>
      <div className='flex h-24 flex-col items-start justify-start gap-5 self-stretch rounded-t-xl border-b border-gray-300 bg-white pt-5'>
        <div className='inline-flex items-center justify-center gap-2 self-stretch px-6'>
          <div className='flex items-center justify-start gap-2.5 pr-2.5'>
            <div className={`h-5 w-5 rounded-full ${bulletColor}`} />
          </div>
          <div className='w-56 text-base font-medium leading-normal text-indigo-900'>{title}</div>
          <div className='inline-flex flex-col items-end justify-center'>
            <p className='text-base font-medium leading-normal text-indigo-900'>{value}</p>
            <p className='text-xs font-normal leading-none text-gray-500'>{descriptor}</p>
          </div>
        </div>
      </div>
      <div className='flex shrink grow basis-0 flex-col items-start justify-start self-stretch'>
        {assumptions.map((assumption) => (
          <div
            key={generateRandomString(5)}
            className='inline-flex items-center justify-start gap-5 self-stretch border-b border-slate-200 bg-neutral-50 px-6 py-3 last:rounded-b-xl'
          >
            <p className='w-64 self-stretch text-wrap text-sm font-medium leading-tight text-indigo-900'>
              {assumption}
            </p>
            {/* <div className="Button w-6 h-6 p-2 bg-violet-50 rounded border border-violet-50 justify-center items-center gap-2 flex">
          <div className="w-3 h-3 relative" />
        </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSizeCard;

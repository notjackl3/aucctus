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
    <div className='aucctus-border-secondary aucctus-bg-primary inline-flex w-96 flex-col items-start justify-start rounded-xl border shadow'>
      <div className='aucctus-border-primary aucctus-bg-primary flex h-28 flex-col items-start justify-start gap-5 self-stretch rounded-t-xl border-b pt-5'>
        <div className='inline-flex items-center justify-center gap-2 self-stretch px-6'>
          <div className='flex items-center justify-start gap-2.5 pr-2.5'>
            <div className={`h-5 w-5 rounded-full ${bulletColor}`} />
          </div>
          <div className='aucctus-text-brand-primary aucctus-text-md w-56'>
            {title}
          </div>
          <div className='flex flex-col items-end justify-center gap-2.5'>
            <div className='inline-flex flex-col items-end justify-center'>
              <p className='aucctus-text-brand-secondary aucctus-text-md'>
                {value}
              </p>
              <p className='aucctus-text-secondary aucctus-text-xs'>
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
            key={utils.string.generateRandomString(8)}
            className='aucctus-border-secondary aucctus-bg-secondary-subtle inline-flex items-center justify-start gap-5 self-stretch border-b px-6 py-3 last:rounded-b-xl'
          >
            <p className='aucctus-text-primary aucctus-text-sm w-full self-stretch'>
              {assumption}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketSizeCard;

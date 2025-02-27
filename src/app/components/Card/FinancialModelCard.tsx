import Icon from '@components/Icon';
import React from 'react';

interface IFinancialModelCard {
  heading: string;
  value: string;
  content: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const FinancialModelCard: React.FC<IFinancialModelCard> = ({
  heading,
  value,
  content,
  onClick,
}) => {
  return (
    <div className='aucctus-border-secondary aucctus-bg-primary inline-flex h-auto max-h-fit w-full min-w-80 max-w-96 flex-col items-start justify-start gap-2.5 self-stretch rounded-xl border p-5 pb-8'>
      <div className='inline-flex items-start justify-start gap-1.5 self-stretch'>
        <span className='aucctus-text-secondary aucctus-text-sm-bold shrink grow basis-0'>
          {heading}
        </span>
      </div>
      <div className='aucctus-border-primary inline-flex items-center justify-start gap-3 self-stretch border-b pb-3'>
        <h3 className='aucctus-text-brand-secondary aucctus-text-md-bold'>
          {value}
        </h3>
        <button
          className='btn btn-primary-light btn-no-border aucctus-border-secondary h-8 w-8 p-0 [&>svg>use]:stroke-primary-600'
          onClick={onClick}
        >
          <Icon variant='book-open' strokeWidth={6} />
        </button>
      </div>

      <p className='aucctus-text-secondary aucctus-text-md self-stretch'>
        {content}
      </p>
    </div>
  );
};

export default FinancialModelCard;

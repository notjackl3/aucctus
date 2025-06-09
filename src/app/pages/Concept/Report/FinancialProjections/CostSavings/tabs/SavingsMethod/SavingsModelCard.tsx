import React from 'react';
import { Icon, ComponentTooltip } from '@components';
import { ISavingsV2 } from '@libs/api/types/concept/financialProjectionV2';

interface SavingsConsideration {
  title: string;
  description?: string;
  icon: string;
}

interface SavingsModelCardProps {
  savingsData?: ISavingsV2;
  savingsConsiderations?: SavingsConsideration[];
}

const SavingsModelCard: React.FC<SavingsModelCardProps> = ({
  savingsData,
  savingsConsiderations,
}) => {
  const price = savingsData?.savingsAmount;
  const unit = (savingsData?.unit ?? 'unit')
    .replace(/per/gi, '/')
    .startsWith('/')
    ? (savingsData?.unit ?? 'unit').replace(/per/gi, '/')
    : `/${(savingsData?.unit ?? 'unit').replace(/per/gi, '/')}`;
  const currency = savingsData?.currency ?? 'USD';
  const reasoning = savingsData?.reasoning;

  const considerations =
    savingsData?.savingsAssumptions?.map((assumption) => ({
      title: assumption,
      icon: 'clipboard' as const,
    })) ?? savingsConsiderations;

  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <h3 className='aucctus-text-lg-medium aucctus-text-tertiary mb-4'>
        Savings Model
      </h3>
      <div className='mb-4 flex items-center gap-1'>
        <span className='aucctus-text-lg-semibold aucctus-text-primary'>
          {currency === 'USD' ? '$' : currency} {price}
        </span>
        <ComponentTooltip
          tip={
            <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border p-4 shadow-lg'>
              <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                Savings Reasoning
              </h5>
              <p className='aucctus-text-xs aucctus-text-secondary leading-relaxed'>
                {reasoning || 'No savings reasoning provided.'}
              </p>
            </div>
          }
        >
          <Icon
            variant='alert-circle'
            className='aucctus-stroke-tertiary mr-2 h-5 w-5 flex-shrink-0'
          />
        </ComponentTooltip>
        <span className='aucctus-text-secondary'>{unit}</span>
      </div>

      <h4 className='aucctus-text-xs aucctus-text-tertiary mb-2'>
        Savings Assumptions
      </h4>
      {considerations && (
        <div className='space-y-3'>
          {considerations.map((consideration, index) => (
            <div
              key={index}
              className='aucctus-border-secondary flex items-center gap-2 rounded-md border p-3'
            >
              <div className='aucctus-bg-brand-secondary-hover flex h-6 w-6 items-center justify-center rounded-full'>
                <Icon
                  variant={consideration.icon as any}
                  className='aucctus-stroke-brand-primary h-6 w-6 p-1'
                />
              </div>
              <span className='aucctus-text-sm aucctus-text-secondary'>
                {consideration.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavingsModelCard;

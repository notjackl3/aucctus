import React from 'react';
import { executiveDashboardUIText } from './config';
import { Star } from 'lucide-react';

interface DifferentiatorsCardProps {
  differentiators: any[];
}

const DifferentiatorsCard: React.FC<DifferentiatorsCardProps> = ({
  differentiators,
}) => {
  return (
    <div className='aucctus-border-primary aucctus-bg-primary h-full min-h-[350px] rounded-lg border lg:col-span-1'>
      <div className='flex h-full flex-col p-6'>
        <h3 className='aucctus-text-xl-semibold aucctus-text-primary mb-4 flex items-center gap-2'>
          <Star className='aucctus-stroke-info-primary h-5 w-5' />
          {executiveDashboardUIText.sections.differentiators}
        </h3>

        <div className='flex-1 space-y-3 overflow-y-auto'>
          {differentiators.length > 0 ? (
            differentiators.map((differentiator, index) => (
              <div
                key={
                  (differentiator &&
                  typeof differentiator === 'object' &&
                  'uuid' in differentiator
                    ? (differentiator.uuid as string)
                    : null) ||
                  (differentiator &&
                  typeof differentiator === 'object' &&
                  'id' in differentiator
                    ? (differentiator.id as string)
                    : null) ||
                  index
                }
                className='aucctus-border-info-extra-subtle aucctus-bg-info-subtle rounded-lg border p-3'
              >
                <div className='flex items-center gap-2'>
                  <div className='aucctus-bg-info-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full'>
                    <span className='aucctus-text-xs-semibold aucctus-text-info-primary'>
                      {(differentiator &&
                      typeof differentiator === 'object' &&
                      'order' in differentiator
                        ? (differentiator.order as number)
                        : null) ||
                        (differentiator &&
                        typeof differentiator === 'object' &&
                        'id' in differentiator
                          ? (differentiator.id as string)
                          : null) ||
                        index + 1}
                    </span>
                  </div>
                  <p className='aucctus-text-xs aucctus-text-primary break-words'>
                    {(differentiator &&
                    typeof differentiator === 'object' &&
                    'description' in differentiator
                      ? (differentiator.description as string)
                      : null) ||
                      (differentiator &&
                      typeof differentiator === 'object' &&
                      'title' in differentiator
                        ? (differentiator.title as string)
                        : null) ||
                      'No description'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className='aucctus-text-sm aucctus-text-secondary'>
              No differentiators available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DifferentiatorsCard);

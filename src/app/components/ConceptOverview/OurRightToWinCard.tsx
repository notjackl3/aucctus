import { Icon } from '@components';
import React from 'react';
import { executiveDashboardUIText } from './config';

interface OurRightToWinCardProps {
  rightsToWin: any[];
}

const OurRightToWinCard: React.FC<OurRightToWinCardProps> = ({
  rightsToWin,
}) => {
  return (
    <div className='aucctus-border-primary aucctus-bg-primary h-full min-h-[350px] rounded-lg border lg:col-span-1'>
      <div className='flex h-full flex-col p-6'>
        <h3 className='aucctus-text-xl-semibold aucctus-text-primary mb-4 flex items-center gap-2'>
          <Icon
            variant='target'
            className='aucctus-stroke-success-primary h-5 w-5'
          />
          {executiveDashboardUIText.sections.ourRightToWin}
        </h3>

        <div className='flex-1 space-y-3 overflow-y-auto'>
          {rightsToWin.length > 0 ? (
            rightsToWin.map((item, index) => (
              <div
                key={
                  (item && typeof item === 'object' && 'uuid' in item
                    ? (item.uuid as string)
                    : null) ||
                  (item && typeof item === 'object' && 'id' in item
                    ? (item.id as string)
                    : null) ||
                  index
                }
                className='aucctus-border-success-extra-subtle aucctus-bg-success-subtle rounded-lg border p-3'
              >
                <div className='flex items-center gap-2'>
                  <div className='aucctus-bg-success-secondary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full'>
                    <span className='aucctus-text-xs-semibold aucctus-text-success-primary'>
                      {(item && typeof item === 'object' && 'order' in item
                        ? (item.order as number)
                        : null) ||
                        (item && typeof item === 'object' && 'id' in item
                          ? (item.id as string)
                          : null) ||
                        index + 1}
                    </span>
                  </div>
                  <p className='aucctus-text-xs aucctus-text-primary break-words'>
                    {(item && typeof item === 'object' && 'description' in item
                      ? (item.description as string)
                      : null) ||
                      (item && typeof item === 'object' && 'title' in item
                        ? (item.title as string)
                        : null) ||
                      'No description'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className='aucctus-text-sm aucctus-text-secondary'>
              No rights to win available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(OurRightToWinCard);

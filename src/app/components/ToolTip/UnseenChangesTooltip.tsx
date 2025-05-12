import { FunctionComponent } from 'react';
import { Card, Icon } from '@components';
import { cn } from '@libs/utils/react';
import utils from '@libs/utils';

interface UnseenChangesTooltipProps {
  conceptTitle: string;
  updatedAt: string;
}

const UnseenChangesTooltip: FunctionComponent<UnseenChangesTooltipProps> = ({
  conceptTitle,
  updatedAt,
}) => {
  // Format the time since last update using the utility functions
  const timeAgo = utils.time.dateFormatter(updatedAt);

  return (
    <Card.Detail
      cardClassName={cn(
        'shadow-lg',
        'aucctus-bg-primary border aucctus-border-secondary rounded-xl p-3',
      )}
      headerClassName='aucctus-bg-primary border-b aucctus-border-secondary'
      title='New Changes Available'
      isHideFooter={true}
    >
      <div className='flex w-full flex-col'>
        <div className='mb-1 w-full'>
          <div className='flex items-start gap-2 p-2'>
            <Icon
              variant='clock'
              width={20}
              height={20}
              className='stroke-blueDark-600'
            />
            <div className='flex flex-col'>
              <span className='aucctus-text-md'>
                This concept was updated {timeAgo}
              </span>
              <span className='aucctus-text-sm aucctus-text-secondary mt-0.5'>
                Click to view{' '}
                <span className='font-medium'>{conceptTitle}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card.Detail>
  );
};

export { UnseenChangesTooltip };

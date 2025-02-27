import images from '@assets/img';
import { Button, Icon } from '@components';
import { IStartup } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React from 'react';

interface SidebarItemProps {
  startup: IStartup;
  isSelected: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  startup,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'group flex cursor-pointer flex-col items-start gap-3 rounded-lg p-4',
        {
          'aucctus-bg-tertiary': isSelected,
          'aucctus-bg-primary-hover': !isSelected,
        },
      )}
      onClick={onClick}
    >
      <div className='flex w-full flex-row items-center justify-between'>
        <div className='flex items-center'>
          <div className='h-8 w-8 overflow-hidden rounded-full'>
            <img
              alt='company-logo'
              src={`https://logo.clearbit.com/${startup.domain || ''}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  images.companyLogoDefault;
              }}
            />
          </div>
          <h3 className='aucctus-text-sm-medium aucctus-text-primary ml-2'>
            {startup.name}
          </h3>
        </div>

        {startup.domain && (
          <Button
            color='secondary'
            size='sm'
            noBorder
            onClick={(e) => {
              e.stopPropagation();
              window.open(startup.domain, '_blank');
            }}
          >
            <Icon variant='link' />
          </Button>
        )}
      </div>
      <p className='aucctus-text-xs aucctus-text-secondary line-clamp-3'>
        {startup.overview}
      </p>
    </div>
  );
};

export default SidebarItem;

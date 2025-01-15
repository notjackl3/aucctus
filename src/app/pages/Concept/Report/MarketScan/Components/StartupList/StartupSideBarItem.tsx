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
        'group flex cursor-pointer flex-col items-start gap-3 p-4',
        {
          'bg-gray-100': isSelected,
          'hover:bg-gray-50': !isSelected,
        },
      )}
      onClick={onClick}
    >
      <div className='flex w-full flex-row items-center justify-between'>
        <div className='flex items-center'>
          <div className='h-8 w-8 overflow-hidden rounded-full'>
            <img
              alt='company-logo'
              src={`https://logo.clearbit.com/${startup.domain}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  images.companyLogoDefault;
              }}
            />
          </div>
          <h3 className='ml-2 text-sm font-medium text-gray-900'>
            {startup.name}
          </h3>
        </div>

        <Button
          color='light'
          size='sm'
          noBorder
          onClick={(e) => {
            e.stopPropagation();
            window.open(startup.domain, '_blank');
          }}
        >
          <Icon variant='link' />
        </Button>
      </div>
      <p className='line-clamp-3 text-[12px] font-normal leading-[18px] text-[#0C111D]'>
        {startup.overview}
      </p>
    </div>
  );
};

export default SidebarItem;

import images from '@assets/img';
import { Badge, Button, Icon } from '@components';
import { IIncumbent } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React from 'react';

interface SidebarItemProps {
  incumbent: IIncumbent;
  isSelected: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  incumbent,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'group flex cursor-pointer flex-col items-start gap-3 rounded-lg p-4',
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
              src={`https://logo.clearbit.com/${incumbent.domain || ''}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  images.companyLogoDefault;
              }}
            />
          </div>
          <h3 className='ml-2 text-sm font-medium text-gray-900'>
            {incumbent.name}
          </h3>
        </div>
        {incumbent.domain && (
          <Button
            color='light'
            noBorder
            size='sm'
            onClick={(e) => {
              e.stopPropagation();
              window.open(incumbent.domain, '_blank');
            }}
          >
            <Icon variant='link' height='12' width='12' stroke='#2B3674' />
          </Button>
        )}
      </div>
      <p className='line-clamp-3 text-[12px] font-normal leading-[18px] text-[#0C111D]'>
        {incumbent.overview}
      </p>
      {/* TODO: Replace */}
      <Badge.Default
        classNameBadge={
          incumbent.hasCompetitiveProduct ? 'bg-primary-50' : 'bg-[#fdf2fa]'
        }
        classNameLabel={
          incumbent.hasCompetitiveProduct
            ? 'text-primary-500'
            : 'text-[#ee46bc]'
        }
        value={
          incumbent.hasCompetitiveProduct
            ? 'Competitive Product'
            : 'No Competitive Product'
        }
      />
    </div>
  );
};

export default SidebarItem;

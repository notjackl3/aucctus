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
            color='secondary'
            noBorder
            size='sm'
            onClick={(e) => {
              e.stopPropagation();
              window.open(incumbent.domain, '_blank');
            }}
          >
            <Icon variant='link' height='12' width='12' />
          </Button>
        )}
      </div>
      <p className='aucctus-text-xs aucctus-text-secondary line-clamp-3'>
        {incumbent.overview}
      </p>
      {/* TODO: Replace */}
      <Badge.Default
        classNameBadge={cn('aucctus-bg-secondary', {
          'aucctus-bg-warning-primary': incumbent.hasCompetitiveProduct,
          'aucctus-bg-secondary': !incumbent.hasCompetitiveProduct,
        })}
        classNameLabel={cn({
          'aucctus-text-primary': !incumbent.hasCompetitiveProduct,
          'aucctus-text-warning-primary': incumbent.hasCompetitiveProduct,
        })}
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

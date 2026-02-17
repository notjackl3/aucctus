import React from 'react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface TabBannerProps {
  icon: string;
  title: string;
  description: string;
}

const TabBanner: React.FC<TabBannerProps> = ({ icon, title, description }) => {
  return (
    <div className='aucctus-bg-brand-primary aucctus-border-primary rounded-lg border p-4'>
      <div className='flex items-start gap-3'>
        <div className='aucctus-bg-brand-secondary rounded-md p-2'>
          <DynamicIcon
            variant={icon}
            className='aucctus-stroke-brand-primary h-4 w-4'
          />
        </div>
        <div>
          <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
            {title}
          </h3>
          <p className='aucctus-text-sm aucctus-text-secondary mt-0.5'>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TabBanner;

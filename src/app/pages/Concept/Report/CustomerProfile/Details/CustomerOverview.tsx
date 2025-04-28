import defaultAvatar from '@assets/img/avatar.png';
import { Badge, Card } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { ICustomerProfile } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { forwardRef } from 'react';

interface CustomerOverviewProps {
  profile: ICustomerProfile;
  description: {
    value: string;
    handleChange: (value: string) => void;
    handleSave: () => void;
    handleCancel: () => void;
  };
  className?: string;
}

const CustomerOverview = forwardRef<HTMLDivElement, CustomerOverviewProps>(
  ({ profile, description, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'aucctus-bg-primary aucctus-border-primary w-full rounded-lg border shadow-sm h-fit',
          className,
        )}
      >
        <div className='flex flex-col p-6'>
          {/* Header with avatar, nickname and name */}
          <div className='mb-6 flex items-start gap-4'>
            <img
              className='aucctus-border-primary h-16 w-16 self-center rounded-full border'
              alt='avatar'
              src={profile?.avatarUrl || defaultAvatar}
            />
            <div className='flex flex-col'>
              <div className='aucctus-bg-brand-subtle inline-block rounded-full'>
                <Badge.Default
                  value={profile?.nickname}
                  classNameBadge='aucctus-border-brand-secondary aucctus-bg-secondary-subtle border rounded-full items-center justify-center'
                  classNameLabel='aucctus-text-brand-secondary aucctus-text-sm-medium'
                />
              </div>
              <h2 className='aucctus-text-primary aucctus-header-xs-semibold mt-2'>
                {profile?.name}
              </h2>
            </div>
          </div>

          {/* Details section */}
          <div className='mt-2'>
            <div className='flex-1'>
              {/* Overview section */}
              <div className='mb-6'>
                <h3 className='aucctus-text-secondary aucctus-text-md-medium mb-2 uppercase tracking-wider'>
                  OVERVIEW
                </h3>
                <EditModeSwitcher
                  containerClassName='aucctus-text-secondary aucctus-text-md !cursor-pencil'
                  name='description'
                  value={description.value}
                  onChange={(e) => description.handleChange(e.target.value)}
                  handleSave={description.handleSave}
                  handleCancel={description.handleCancel}
                />
              </div>

              {/* Demographics section */}
              <div>
                <h3 className='aucctus-text-secondary aucctus-text-md-medium mb-2 uppercase tracking-wider'>
                  DEMOGRAPHICS
                </h3>
                <Card.Demographics profile={profile} canEdit={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CustomerOverview.displayName = 'CustomerOverview';

export default CustomerOverview;

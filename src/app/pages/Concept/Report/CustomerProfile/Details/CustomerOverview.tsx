import defaultAvatar from '@assets/img/avatar.png';
import { Badge, Icon } from '@components';
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

// Extend ICustomerProfile for the demo to include occupation and education
interface ExtendedCustomerProfile extends ICustomerProfile {
  educationLevel?: string;
  occupation?: string;
}

const CustomerOverview = forwardRef<HTMLDivElement, CustomerOverviewProps>(
  ({ profile, description, className }, ref) => {
    // Cast to extended profile for the demo
    const extendedProfile = profile as ExtendedCustomerProfile;

    return (
      <div
        ref={ref}
        className={cn(
          'aucctus-bg-primary aucctus-border-primary h-fit w-full rounded-lg border shadow-sm',
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
                  value={profile?.nickname || 'Primary'}
                  classNameBadge='aucctus-border-brand-secondary aucctus-bg-secondary-subtle border rounded-full items-center justify-center'
                  classNameLabel='aucctus-text-brand-secondary aucctus-text-sm-medium'
                />
              </div>
              <h2 className='aucctus-text-primary aucctus-header-xs-semibold mt-2'>
                {profile?.name || 'Global Students'}
              </h2>
              <div className='aucctus-text-tertiary aucctus-text-sm mt-1'>
                Represented by Sarah Lim
              </div>
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
                <p className='aucctus-text-secondary aucctus-text-md'>
                  {description.value ||
                    'Global Students represent a significant market opportunity with unique challenges in maintaining healthy eating habits while studying abroad. They exhibit distinct behavioral patterns including limited cooking facilities, irregular schedules, and a strong desire for wellness routines. This segment shows high nutritional awareness, growing purchasing power, and alignment with sustainability values.'}
                </p>
              </div>

              {/* Demographics section */}
              <div>
                <h3 className='aucctus-text-secondary aucctus-text-md-medium mb-2 uppercase tracking-wider'>
                  SAMPLE DEMOGRAPHICS
                </h3>

                <div className='aucctus-text-secondary space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Icon
                      variant='globe'
                      height={16}
                      width={16}
                      className='aucctus-stroke-secondary mr-1'
                    />
                    <div className='grid w-full grid-cols-3'>
                      <span className='aucctus-text-md-semibold'>
                        Geography:
                      </span>
                      <span className='aucctus-text-md col-span-2'>
                        {profile?.geoLocation || 'Ontario, Canada'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Icon
                      variant='calendar'
                      height={16}
                      width={16}
                      className='aucctus-stroke-secondary mr-1'
                    />
                    <div className='grid w-full grid-cols-3'>
                      <span className='aucctus-text-md-semibold'>
                        Age Range:
                      </span>
                      <span className='aucctus-text-md col-span-2'>
                        {profile?.ageRange || '24-35'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Icon
                      variant='user-group'
                      height={16}
                      width={16}
                      className='aucctus-stroke-secondary mr-1'
                    />
                    <div className='grid w-full grid-cols-3'>
                      <span className='aucctus-text-md-semibold'>
                        Family Size:
                      </span>
                      <span className='aucctus-text-md col-span-2'>
                        {profile?.familySize || '2 (Lives with roommate)'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Icon
                      variant='currency-dollar'
                      height={16}
                      width={16}
                      className='aucctus-stroke-secondary mr-1'
                    />
                    <div className='grid w-full grid-cols-3'>
                      <span className='aucctus-text-md-semibold'>Income:</span>
                      <span className='aucctus-text-md col-span-2'>
                        {`${profile?.incomeLower ? `$${profile.incomeLower / 1000}K` : '$40K'}-${profile?.incomeUpper ? `$${profile.incomeUpper / 1000}K` : '$75K'} (Student with part-time job)`}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Icon
                      variant='book-open'
                      height={16}
                      width={16}
                      className='aucctus-stroke-secondary mr-1'
                    />
                    <div className='grid w-full grid-cols-3'>
                      <span className='aucctus-text-md-semibold'>
                        Education:
                      </span>
                      <span className='aucctus-text-md col-span-2'>
                        {extendedProfile?.educationLevel || 'Graduate Student'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Icon
                      variant='briefcase'
                      height={16}
                      width={16}
                      className='aucctus-stroke-secondary mr-1'
                    />
                    <div className='grid w-full grid-cols-3'>
                      <span className='aucctus-text-md-semibold'>
                        Occupation:
                      </span>
                      <span className='aucctus-text-md col-span-2'>
                        {extendedProfile?.occupation ||
                          'Part-time Marketing Assistant'}
                      </span>
                    </div>
                  </div>
                </div>
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

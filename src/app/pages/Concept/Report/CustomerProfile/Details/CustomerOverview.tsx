import defaultAvatar from '@assets/img/avatar.png';
import { ICustomerProfile } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { forwardRef, useCallback } from 'react';
import {
  BookOpen,
  Briefcase,
  Calendar,
  DollarSign,
  Globe,
  Users,
} from 'lucide-react';

// Icon stroke constant for consistency
const MAIN_ICON_STROKE = 'aucctus-stroke-brand-primary';

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

    const formatIncome = useCallback((income: number) => {
      if (income < 1000) {
        // If income is a small number like 80 or 85, assume it's already in thousands
        return `$${income}K`;
      } else {
        // Otherwise divide by 1000
        return `$${income / 1000}K`;
      }
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          'aucctus-bg-primary aucctus-border-primary h-fit w-full rounded-lg border shadow-sm',
          className,
        )}
      >
        <div className='flex flex-col px-6 pb-4 pt-4'>
          {/* Header with avatar, segment and name */}
          <div className='mb-6 flex items-start gap-4'>
            <img
              className='aucctus-border-primary h-16 w-16 self-center rounded-full border object-cover'
              alt='avatar'
              src={profile?.avatarUrl || defaultAvatar}
            />
            <div className='flex flex-col'>
              {/* Primary badge */}
              {profile?.isPrimary && (
                <div className='mb-1 flex'>
                  <span className='aucctus-bg-brand-secondary aucctus-text-brand-tertiary flex items-center gap-1 rounded-full px-3 py-1 text-sm'>
                    <Briefcase size={14} className={MAIN_ICON_STROKE} />
                    Primary
                  </span>
                </div>
              )}
              <h2 className='aucctus-text-primary aucctus-header-xs-semibold mt-2'>
                {profile?.segment || 'Global Students'}
              </h2>
              <div className='aucctus-text-tertiary aucctus-text-sm mt-1'>
                Represented by {profile?.name}
              </div>
            </div>
          </div>

          {/* Details section */}
          <div className='mt-2'>
            <div className='flex-1'>
              {/* Overview section */}
              <div className='mb-6 pb-4'>
                <h3 className='aucctus-text-secondary aucctus-text-md-medium mb-2 uppercase tracking-wider'>
                  OVERVIEW
                </h3>
                <p className='aucctus-text-secondary aucctus-text-md hyphens-auto break-words'>
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
                  <div className='flex items-start gap-2'>
                    <Globe
                      size={16}
                      className='aucctus-stroke-secondary mr-1 mt-0.5 flex-shrink-0'
                    />
                    <div className='flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-4'>
                      <span className='aucctus-text-md-semibold flex-shrink-0 sm:w-24'>
                        Geography:
                      </span>
                      <span className='aucctus-text-md break-words'>
                        {profile?.geoLocation || 'Ontario, Canada'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-start gap-2'>
                    <Calendar
                      size={16}
                      className='aucctus-stroke-secondary mr-1 mt-0.5 flex-shrink-0'
                    />
                    <div className='flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-4'>
                      <span className='aucctus-text-md-semibold flex-shrink-0 sm:w-24'>
                        Age Range:
                      </span>
                      <span className='aucctus-text-md break-words'>
                        {profile?.ageRange || '24-35'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-start gap-2'>
                    <Users
                      size={16}
                      className='aucctus-stroke-secondary mr-1 mt-0.5 flex-shrink-0'
                    />
                    <div className='flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-4'>
                      <span className='aucctus-text-md-semibold flex-shrink-0 sm:w-24'>
                        Family Size:
                      </span>
                      <span className='aucctus-text-md break-words'>
                        {profile?.familySize || '2 (Lives with roommate)'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-start gap-2'>
                    <DollarSign
                      size={16}
                      className='aucctus-stroke-secondary mr-1 mt-0.5 flex-shrink-0'
                    />
                    <div className='flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-4'>
                      <span className='aucctus-text-md-semibold flex-shrink-0 sm:w-24'>
                        Income:
                      </span>
                      <span className='aucctus-text-md break-words'>
                        {`${profile?.incomeLower ? formatIncome(profile.incomeLower) : '$40K'}-${profile?.incomeUpper ? formatIncome(profile.incomeUpper) : '$75K'}`}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-start gap-2'>
                    <BookOpen
                      size={16}
                      className='aucctus-stroke-secondary mr-1 mt-0.5 flex-shrink-0'
                    />
                    <div className='flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-4'>
                      <span className='aucctus-text-md-semibold flex-shrink-0 sm:w-24'>
                        Education:
                      </span>
                      <span className='aucctus-text-md break-words'>
                        {extendedProfile?.educationLevel || 'Graduate Student'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-start gap-2'>
                    <Briefcase
                      size={16}
                      className='aucctus-stroke-secondary mr-1 mt-0.5 flex-shrink-0'
                    />
                    <div className='flex min-w-0 flex-1 flex-col sm:flex-row sm:gap-4'>
                      <span className='aucctus-text-md-semibold flex-shrink-0 sm:w-24'>
                        Occupation:
                      </span>
                      <span className='aucctus-text-md break-words'>
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

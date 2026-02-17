import React from 'react';

import { ICustomerProfile } from '@libs/api/types';
// TODO: This should be a PNG
import { Card } from '@components';
import utils from '@libs/utils';
import defaultAvatar from '../../assets/img/avatar.png';
import { Users } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface ICustomerProfilesCardProps {
  profile: ICustomerProfile | undefined;
  onViewProfilesClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

// Define the keys you want to include
const DEMOGRAPHIC_KEYS = [
  'geoLocation',
  'ageRange',
  'familySize',
  'incomeRange',
] as const;

// Use `Pick` to create a new type that only includes the demographic keys
type DemographicProfile = keyof Pick<
  ICustomerProfile,
  (typeof DEMOGRAPHIC_KEYS)[number]
>;
const DEMOGRAPHIC_VALUE_MAP: Record<
  DemographicProfile,
  { prefix: string; icon: string }
> = {
  geoLocation: {
    icon: 'globe',
    prefix: 'Location:',
  },
  ageRange: {
    icon: 'umbrella',
    prefix: 'Age Range:',
  },

  familySize: {
    icon: 'user-group',
    prefix: 'Family Size:',
  },
  incomeRange: {
    icon: 'piggy-bank',
    prefix: 'Average Income:',
  },
};

const CustomerProfilesCard: React.FC<ICustomerProfilesCardProps> = ({
  profile,
  onViewProfilesClick,
}) => {
  return (
    <Card.Detail
      title='Customer Profiles'
      subtitle='Breakdown of target user pain points and jobs to be done'
      headerClassName='min-h-[92px]'
      contentClassName='h-[360px]'
      footerAction={
        <button
          className='btn btn-light'
          onClick={onViewProfilesClick}
          aria-label='View Customer Profiles'
        >
          <span>{<Users size={16} stroke='#626BA3' />}</span>
          View Profile
        </button>
      }
    >
      <div className='inline-flex h-full w-full flex-col items-center justify-start gap-6 p-6'>
        {/* Header  */}
        <div className='flex w-full items-center justify-start gap-4'>
          <img
            className='aucctus-border-secondary relative h-16 w-16 rounded-full border'
            alt='avatar'
            src={profile?.avatarUrl || defaultAvatar}
          />
          <div className='inline-flex shrink grow basis-0 flex-col items-start justify-start gap-1'>
            <h6 className='aucctus-text-primary aucctus-text-md self-stretch text-base'>
              {profile?.segment}
            </h6>
            <span className='aucctus-text-primary aucctus-text-md-bold h-7 self-stretch text-xl'>
              {profile?.name}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className='inline-flex h-full w-full flex-col items-start justify-start gap-3.5'>
          <div className='aucctus-text-lg-bold aucctus-text-primary self-stretch'>
            Demographics
          </div>
          {/* Demographics */}
          <div className='inline-flex flex-col items-start justify-start gap-5'>
            {DEMOGRAPHIC_KEYS.map((item) => (
              <div
                key={`${item}${utils.string.generateRandomString(6)}`}
                className='inline-flex h-4 items-center justify-start gap-3 self-stretch'
              >
                <DynamicIcon variant={DEMOGRAPHIC_VALUE_MAP[item].icon} />
                <span className='aucctus-text-tertiary aucctus-text-sm shrink grow basis-0 text-sm'>
                  {DEMOGRAPHIC_VALUE_MAP[item].prefix}{' '}
                  {profile ? profile[item] : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card.Detail>
  );
};

export default CustomerProfilesCard;

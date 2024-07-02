import React from 'react';
import ConceptDetailCard from '../../Cards/ConceptDetailCard';
import Icon from '../../Icons/Icon/Icon';
import { ICustomerProfile } from '../../../../libs/api/types';
// TODO: This should be a PNG
import defaultAvatar from '../../../assets/avatar.svg';

interface ICustomerProfilesCardProps {
  profile: ICustomerProfile | undefined;
  onViewProfilesClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

// Define the keys you want to include
const DEMOGRAPHIC_KEYS = ['geoLocation', 'ageRange', 'familySize', 'incomeRange'] as const;

// Use `Pick` to create a new type that only includes the demographic keys
type DemographicProfile = keyof Pick<ICustomerProfile, (typeof DEMOGRAPHIC_KEYS)[number]>;
const DEMOGRAPHIC_VALUE_MAP: Record<DemographicProfile, { prefix: string; icon: IconVariant }> = {
  geoLocation: {
    icon: 'globe',
    prefix: 'Geographic Location:',
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

const CustomerProfilesCard: React.FC<ICustomerProfilesCardProps> = ({ profile, onViewProfilesClick }) => {
  return (
    <ConceptDetailCard
      title='Customer Profiles'
      subtitle='Breakdown of target user pain points and jobs to be done'
      cardClassName={''}
      footerAction={
        <button className='btn btn-light' onClick={onViewProfilesClick} aria-label='View Customer Profiles'>
          <span>{<Icon variant='user-group' width={16} height={16} stroke='#626BA3' />}</span>
          View Profile
        </button>
      }
    >
      <div className='inline-flex flex-col items-center justify-start gap-6 p-6'>
        {/* Header  */}
        <div className='inline-flex items-center justify-start gap-4'>
          <img className='relative h-16 w-16 rounded-3xl border border-white' alt='avatar' src={defaultAvatar} />
          <div className='inline-flex shrink grow basis-0 flex-col items-start justify-start gap-1'>
            <h6 className="font-['DM Sans'] h-6 self-stretch text-base font-normal text-indigo-900">
              {profile?.nickname}
            </h6>
            <span className="font-['DM Sans'] h-7 self-stretch text-xl font-bold text-indigo-900">{profile?.name}</span>
          </div>
        </div>

        {/* Body */}
        <div className='inline-flex h-48 w-80 flex-col items-start justify-start gap-3.5'>
          <div className="Text font-['DM Sans'] self-stretch text-xs font-bold leading-7 text-indigo-900">
            Demographics
          </div>
          {/* Demographics */}
          <div className='inline-flex h-32 w-80 flex-col items-start justify-start gap-5'>
            {DEMOGRAPHIC_KEYS.map((item) => (
              <div className='inline-flex h-4 items-center justify-start gap-3 self-stretch'>
                <Icon variant={DEMOGRAPHIC_VALUE_MAP[item].icon} />
                <div className="font-['DM Sans'] shrink grow basis-0 text-xs font-normal leading-none text-gray-500">
                  {DEMOGRAPHIC_VALUE_MAP[item].prefix} {profile ? profile[item] : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ConceptDetailCard>
  );
};

export default CustomerProfilesCard;

import { Button, Icon } from '@components';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ICustomerProfile as ICustomerProfileAPI } from '@libs/api/types/concept/concepts';
import type { ICustomerProfile } from './config';

interface CustomerProfilesCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
  conceptUuid?: string; // For navigation routing
  conceptId?: string; // For navigation routing
  // Centralized data props
  customerProfiles?: any[];
  isLoadingCustomerProfiles?: boolean;
  executiveSummary?: string;
}

const CustomerProfilesCard: React.FC<CustomerProfilesCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
  conceptUuid,
  conceptId,
  customerProfiles = [],
  isLoadingCustomerProfiles = false,
  executiveSummary,
}) => {
  const navigate = useNavigate();

  // State to track the selected profile
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    null,
  );

  // Transform real API data to match component interface
  const transformedProfiles = useMemo((): ICustomerProfile[] => {
    if (!customerProfiles || customerProfiles.length === 0) {
      return [];
    }

    return customerProfiles.map(
      (profile: ICustomerProfileAPI, index: number) => {
        // Generate initials from name
        const initials = profile.name
          .split(' ')
          .map((word) => word.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);

        // Gradient colors for profiles without avatars
        const gradientOptions = [
          'from-blue-400 to-blue-600',
          'from-green-400 to-green-600',
          'from-purple-400 to-purple-600',
          'from-pink-400 to-pink-600',
          'from-indigo-400 to-indigo-600',
        ];

        return {
          id: profile.uuid,
          name: profile.name,
          avatar: profile.avatarUrl || '',
          isPrimary: profile.isPrimary || false,
          segment: profile.segment,
          initials,
          gradientColors: gradientOptions[index % gradientOptions.length],
        };
      },
    );
  }, [customerProfiles]);

  // Set initial selection to primary profile when data loads
  useEffect(() => {
    if (customerProfiles && customerProfiles.length > 0 && !selectedProfileId) {
      const primaryProfile =
        customerProfiles.find((p) => p.isPrimary) || customerProfiles[0];
      if (primaryProfile) {
        setSelectedProfileId(primaryProfile.uuid);
      }
    }
  }, [customerProfiles, selectedProfileId]);

  // Get real summary data (no mock fallback)
  const profilesSummary = executiveSummary;

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/concept/${conceptId}/customer-profile`);
    },
    [navigate, conceptId],
  );

  const handleProfileClick = useCallback((profileId: string) => {
    setSelectedProfileId(profileId);
  }, []);

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      onCardClick(index);
    },
    [onCardClick],
  );

  const renderAvatar = useCallback((profile: ICustomerProfile) => {
    if (profile.avatar) {
      return (
        <img
          src={profile.avatar}
          alt={profile.name}
          className='h-full w-full object-cover'
        />
      );
    }

    // Render initials with gradient background for profiles without avatars
    return (
      <div
        className={`h-full w-full bg-gradient-to-br ${profile.gradientColors} flex items-center justify-center`}
      >
        <span className='aucctus-text-xs-semibold aucctus-text-white'>
          {profile.initials}
        </span>
      </div>
    );
  }, []);

  const renderProfileCard = useCallback(
    (profile: ICustomerProfile) => {
      const isSelected = selectedProfileId === profile.id;

      if (profile.isPrimary) {
        return (
          <div
            key={profile.id}
            className={`aucctus-border-secondary aucctus-bg-tertiary min-h-[60px] cursor-pointer rounded-lg border p-2 transition-shadow hover:shadow-md ${
              isSelected ? 'aucctus-border-brand ring-2 ring-offset-1' : ''
            }`}
            onClick={() => handleProfileClick(profile.id)}
          >
            <div className='flex items-center gap-2'>
              <div className='aucctus-border-tertiary aucctus-bg-quaternary h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border-2'>
                {renderAvatar(profile)}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='aucctus-text-xs-semibold aucctus-text-primary truncate leading-tight'>
                  {profile.segment}
                </p>
                <div className='mt-0.5 flex items-center gap-1'>
                  <span className='aucctus-text-xs aucctus-bg-brand-primary aucctus-text-brand-primary aucctus-border-brand rounded-full border px-1.5 py-0.5'>
                    Primary
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div
          key={profile.id}
          className={`aucctus-border-secondary aucctus-bg-tertiary min-h-[60px] cursor-pointer rounded-lg border p-2 transition-shadow hover:shadow-md ${
            isSelected ? 'aucctus-border-brand ring-2 ring-offset-1' : ''
          }`}
          onClick={() => handleProfileClick(profile.id)}
        >
          <div className='flex items-center gap-2'>
            <div className='aucctus-border-tertiary aucctus-bg-quaternary h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border-2'>
              {renderAvatar(profile)}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='aucctus-text-xs-semibold aucctus-text-primary truncate leading-tight'>
                {profile.segment}
              </p>
              <div className='mt-0.5 flex items-center gap-1'>
                <span className='aucctus-text-xs rounded-full bg-gray-600 px-1.5 py-0.5 text-white'>
                  Secondary
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [renderAvatar, handleProfileClick, selectedProfileId],
  );

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary h-full min-h-[350px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
      <div className='flex h-full flex-col p-6'>
        {/* Progress Bar Navigation */}
        <div className='mb-4'>
          <div className='flex gap-2'>
            {Array.from({ length: totalCards }).map((_, index) => (
              <div key={index} className='flex-1'>
                <div
                  className='aucctus-bg-disabled h-1 cursor-pointer overflow-hidden rounded-full'
                  onClick={(e) => handleProgressBarClick(e, index)}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      index === currentCardIndex
                        ? 'aucctus-bg-primary-solid'
                        : index < currentCardIndex
                          ? 'aucctus-bg-primary-solid'
                          : 'bg-transparent'
                    }`}
                    style={{
                      width:
                        index === currentCardIndex
                          ? `${progress}%`
                          : index < currentCardIndex
                            ? '100%'
                            : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon
              variant='users-03'
              className='aucctus-stroke-tertiary h-4 w-4'
            />
            <h3 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
              Customer Profiles
            </h3>
          </div>
          <Button
            color='secondary'
            size='sm'
            onClick={handleDetailsClick}
            className='aucctus-text-sm-medium aucctus-text-secondary-hover'
          >
            Details
          </Button>
        </div>

        {profilesSummary ? (
          // Two-column layout: Summary + Profile Cards
          <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Left - Primary Customer Summary */}
            <div className='flex flex-col justify-start px-2 py-2'>
              {isLoadingCustomerProfiles ? (
                <div className='aucctus-text-sm aucctus-text-secondary'>
                  Loading customer profiles...
                </div>
              ) : (
                <p className='aucctus-text-sm-semibold aucctus-text-primary'>
                  {profilesSummary}
                </p>
              )}
            </div>

            {/* Right - Profile Cards List */}
            <div className='flex max-h-[220px] min-h-0 flex-col gap-2 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
              {isLoadingCustomerProfiles ? (
                <div className='aucctus-text-sm aucctus-text-secondary'>
                  Loading...
                </div>
              ) : transformedProfiles.length > 0 ? (
                transformedProfiles.slice(0, 4).map(renderProfileCard)
              ) : (
                <div className='aucctus-text-sm aucctus-text-secondary'>
                  No customer profiles available
                </div>
              )}
            </div>
          </div>
        ) : (
          // Single-column layout: Profile Cards only (expanded)
          <div className='flex flex-1 items-center justify-center'>
            {isLoadingCustomerProfiles ? (
              <div className='aucctus-text-lg aucctus-text-secondary'>
                Loading customer profiles...
              </div>
            ) : (
              <div className='grid w-full max-w-[480px] grid-cols-2 gap-4'>
                {transformedProfiles.slice(0, 4).map(renderProfileCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CustomerProfilesCard);

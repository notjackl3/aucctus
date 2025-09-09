import { Button, Icon } from '@components';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ICustomerProfile } from './fixtures';
import { mockCustomerProfiles, mockCustomerProfilesSummary } from './fixtures';

interface CustomerProfilesCardProps {
  currentCardIndex: number;
  progress: number;
  totalCards: number;
  onCardClick: (index: number) => void;
}

const CustomerProfilesCard: React.FC<CustomerProfilesCardProps> = ({
  currentCardIndex,
  progress,
  totalCards,
  onCardClick,
}) => {
  const navigate = useNavigate();

  const handleDetailsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate('/customer-profiles');
    },
    [navigate],
  );

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
      if (profile.isPrimary) {
        return (
          <div
            key={profile.id}
            className='aucctus-border-brand aucctus-bg-brand-secondary rounded-lg border p-2'
          >
            <div className='flex items-center gap-2'>
              <div className='aucctus-border-brand aucctus-bg-primary h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2'>
                {renderAvatar(profile)}
              </div>
              <div className='flex-1'>
                <p className='aucctus-text-xs-semibold aucctus-text-brand-primary leading-tight'>
                  {profile.segment}
                </p>
                <div className='mt-0.5 flex items-center gap-2'>
                  <span className='aucctus-bg-accent-solid aucctus-text-white aucctus-text-xs-semibold rounded-full px-1 py-0.5'>
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
          className='aucctus-border-secondary aucctus-bg-tertiary rounded-lg border p-2'
        >
          <div className='flex items-center gap-2'>
            <div className='aucctus-border-tertiary aucctus-bg-quaternary h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2'>
              {renderAvatar(profile)}
            </div>
            <div className='flex-1'>
              <p className='aucctus-text-xs-semibold aucctus-text-primary leading-tight'>
                {profile.segment}
              </p>
              <div className='mt-0.5 flex items-center gap-2'>
                <span className='aucctus-bg-quaternary aucctus-text-white aucctus-text-xs-semibold rounded-full px-1 py-0.5'>
                  Secondary
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [renderAvatar],
  );

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary h-[320px] cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg'>
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

        <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Left - Primary Customer Summary */}
          <div className='flex flex-col justify-center px-2'>
            <p className='aucctus-text-lg aucctus-text-primary leading-tight'>
              {mockCustomerProfilesSummary.solution}
            </p>
          </div>

          {/* Right - Profile Cards List */}
          <div className='flex min-h-0 flex-col justify-center gap-2 overflow-hidden'>
            {mockCustomerProfiles.map(renderProfileCard)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerProfilesCard);

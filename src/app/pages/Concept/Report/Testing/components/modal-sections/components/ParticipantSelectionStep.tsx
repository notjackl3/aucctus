import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { ICustomerProfile } from '@libs/api/types/concept/concepts';

// Utility function to normalize UUID format (underscores to hyphens)
const normalizeUuid = (uuid: string): string => uuid.replace(/_/g, '-');

interface IParticipantSelectionStepProps {
  profiles: ICustomerProfile[];
  participantCounts: Record<string, number>;
  skippedParticipants: Set<string>;
  lockedParticipants?: Set<string>;
  onParticipantCountChange: (profileUuid: string, newCount: number) => void;
  onRemoveParticipant: (profileUuid: string) => void;
  onSkipParticipant?: (profileUuid: string) => void;
  onUnskipParticipant?: (profileUuid: string) => void;
  isLoading: boolean;
  canEditSkip?: boolean;
}

const ParticipantSelectionStep: React.FC<IParticipantSelectionStepProps> = ({
  profiles,
  participantCounts,
  skippedParticipants,
  lockedParticipants,
  onParticipantCountChange,
  onSkipParticipant,
  onUnskipParticipant,
  isLoading,
  canEditSkip = true,
}) => {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Icon
          variant='loading-02'
          className='aucctus-stroke-primary h-6 w-6 animate-spin'
        />
        <span className='aucctus-text-sm aucctus-text-secondary ml-2'>
          Loading participants...
        </span>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className='aucctus-border-secondary flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8'>
        <div className='aucctus-bg-secondary-subtle mb-4 rounded-full p-3'>
          <Icon variant='users-03' className='aucctus-stroke-tertiary' />
        </div>
        <h3 className='aucctus-text-sm-semibold aucctus-text-primary mb-2 text-center'>
          No customer profiles found
        </h3>
        <p className='aucctus-text-sm aucctus-text-secondary text-center'>
          Create customer profiles first to run synthetic tests.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      {profiles.map((profile) => {
        // Ensure UUID format is consistent (hyphens, not underscores)
        const normalizedUuid = normalizeUuid(profile.uuid);
        const count = participantCounts[normalizedUuid] || 5; // Default to 5 if not set
        const isSelected = count >= 1;
        const isSkipped = skippedParticipants.has(normalizedUuid);
        const isLockedSkip = lockedParticipants?.has(normalizedUuid) ?? false;
        const allowSkipControls =
          canEditSkip &&
          !isLockedSkip &&
          onSkipParticipant &&
          onUnskipParticipant;

        return (
          <div
            key={profile.uuid}
            className='relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all'
          >
            {/* Main content area with conditional background */}
            <div
              className={cn(
                'h-full p-6 transition-all',
                isSkipped
                  ? 'bg-gray-50 opacity-60'
                  : isSelected
                    ? 'bg-gray-100'
                    : 'bg-gray-50 hover:bg-gray-100',
              )}
            >
              <div className='flex items-start gap-3'>
                {/* Avatar */}
                <div className='flex-shrink-0'>
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className='h-12 w-12 rounded-full object-cover'
                    />
                  ) : (
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-300'>
                      <span className='text-sm font-semibold text-gray-700'>
                        {profile.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className='min-w-0 flex-1'>
                  <h4 className='mb-1 text-lg font-semibold text-gray-900'>
                    {profile.segment}
                  </h4>
                  <p className='mb-3 text-sm text-gray-600'>{profile.name}</p>

                  {/* Variant Counter or Skipped State */}
                  {isSkipped ? (
                    <div className='text-sm font-medium text-gray-500'>
                      Skipped
                    </div>
                  ) : (
                    <div className='flex items-center gap-3'>
                      <button
                        onClick={() =>
                          onParticipantCountChange(normalizedUuid, count - 1)
                        }
                        disabled={count <= 1}
                        className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Icon
                          variant='minus'
                          className='h-4 w-4 stroke-gray-600'
                        />
                      </button>

                      <span className='min-w-[2rem] text-center text-lg font-semibold text-gray-900'>
                        {count}
                      </span>

                      <button
                        onClick={() =>
                          onParticipantCountChange(normalizedUuid, count + 1)
                        }
                        disabled={count >= 20}
                        className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        <Icon
                          variant='plus'
                          className='h-4 w-4 stroke-gray-600'
                        />
                      </button>

                      <span className='ml-1 text-sm text-gray-500'>
                        variants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Button positioned outside the grey background */}
            <div
              className={cn(
                'absolute right-4',
                allowSkipControls ? 'top-4' : 'bottom-4',
              )}
            >
              {allowSkipControls ? (
                isSkipped ? (
                  <button
                    onClick={() => onUnskipParticipant(normalizedUuid)}
                    className='cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md'
                  >
                    Unskip
                  </button>
                ) : (
                  <button
                    onClick={() => onSkipParticipant(normalizedUuid)}
                    className='flex h-6 w-6 items-center justify-center rounded-full text-xl text-gray-400 transition-colors hover:text-gray-600'
                  >
                    ×
                  </button>
                )
              ) : (
                isSkipped && (
                  <span className='aucctus-text-xs-semibold aucctus-text-secondary rounded-full bg-gray-100 px-3 py-1'>
                    {isLockedSkip
                      ? 'Managed in Participants tab'
                      : 'Skipped for this run'}
                  </span>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ParticipantSelectionStep);

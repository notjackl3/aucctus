import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  onPersistCountChange?: (profileUuid: string, newCount: number) => void;
  isLoading: boolean;
  canEditSkip?: boolean;
}

/**
 * Individual participant card with local state for debounced API calls
 */
const ParticipantCard: React.FC<{
  profile: ICustomerProfile;
  count: number;
  isSkipped: boolean;
  isSelected: boolean;
  isLockedSkip: boolean;
  canToggle: boolean;
  onCountChange: (profileUuid: string, newCount: number) => void;
  onPersistCountChange?: (profileUuid: string, newCount: number) => void;
  onSkipParticipant?: (profileUuid: string) => void;
  onUnskipParticipant?: (profileUuid: string) => void;
  onCardClick: (
    normalizedUuid: string,
    isSkipped: boolean,
    isLockedSkip: boolean,
  ) => void;
}> = ({
  profile,
  count,
  isSkipped,
  isSelected,
  isLockedSkip,
  canToggle,
  onCountChange,
  onPersistCountChange,
  onSkipParticipant,
  onCardClick,
}) => {
  const normalizedUuid = normalizeUuid(profile.uuid);

  // Local state for immediate UI feedback
  const [localCount, setLocalCount] = useState(count);

  // Track if the user made a change (vs prop sync from API)
  const isDirty = useRef(false);

  // Sync local count when prop changes (from API response)
  useEffect(() => {
    // Only sync if not dirty (i.e., this is from API, not our own change)
    if (!isDirty.current) {
      setLocalCount(count);
    }
  }, [count]);

  // Debounced API call - only fire if dirty (user-initiated change)
  useEffect(() => {
    if (!isDirty.current || !onPersistCountChange) {
      return;
    }

    const timer = setTimeout(() => {
      onPersistCountChange(normalizedUuid, localCount);
      isDirty.current = false; // Reset after API call
    }, 500);

    return () => clearTimeout(timer);
  }, [localCount, normalizedUuid, onPersistCountChange]);

  // Handle count change - update local state immediately, parent state, and debounce API
  const handleCountChange = useCallback(
    (newCount: number) => {
      if (newCount < 1) newCount = 1;
      if (newCount > 20) newCount = 20;

      isDirty.current = true; // Mark as user-initiated
      setLocalCount(newCount);
      onCountChange(normalizedUuid, newCount);
    },
    [normalizedUuid, onCountChange],
  );

  return (
    <div className='group relative'>
      {/* Clickable Card - using div instead of button to allow nested buttons */}
      <div
        role='button'
        tabIndex={canToggle ? 0 : -1}
        onClick={() => onCardClick(normalizedUuid, isSkipped, isLockedSkip)}
        onKeyDown={(e) => {
          if (canToggle && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onCardClick(normalizedUuid, isSkipped, isLockedSkip);
          }
        }}
        className={cn(
          'w-full rounded-xl border p-4 text-left shadow-sm transition-all',
          isSelected
            ? 'aucctus-border-brand aucctus-bg-brand-secondary'
            : 'aucctus-border-secondary aucctus-bg-primary',
          canToggle && !isSelected && 'hover:aucctus-bg-secondary-subtle',
          canToggle ? 'cursor-pointer' : 'cursor-default',
        )}
      >
        <div className='flex items-start gap-4'>
          {/* Avatar */}
          <div className='flex-shrink-0'>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className='h-12 w-12 rounded-full object-cover'
              />
            ) : (
              <div className='aucctus-bg-secondary flex h-12 w-12 items-center justify-center rounded-full'>
                <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
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
          <div className='min-w-0 flex-1 space-y-2 pr-8'>
            <div className='aucctus-text-md-semibold aucctus-text-primary'>
              {profile.segment}
            </div>
            <div className='aucctus-text-sm aucctus-text-secondary'>
              {profile.name}
            </div>

            {/* Variant Counter or Skipped Badge */}
            {isSelected ? (
              <div className='flex w-fit items-center gap-2 rounded-lg px-3 py-1.5'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountChange(localCount - 1);
                  }}
                  disabled={localCount <= 1}
                  className='aucctus-bg-primary hover:aucctus-bg-secondary flex h-5 w-5 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Icon
                    variant='minus'
                    className='aucctus-stroke-secondary h-3 w-3'
                  />
                </button>
                <span className='aucctus-text-sm-medium aucctus-text-primary min-w-[20px] px-1 text-center'>
                  {localCount}
                </span>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountChange(localCount + 1);
                  }}
                  disabled={localCount >= 20}
                  className='aucctus-bg-primary hover:aucctus-bg-secondary flex h-5 w-5 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Icon
                    variant='plus'
                    className='aucctus-stroke-secondary h-3 w-3'
                  />
                </button>
                <span className='aucctus-text-xs aucctus-text-secondary ml-1'>
                  variants
                </span>
              </div>
            ) : (
              <div className='aucctus-text-secondary inline-flex items-center rounded px-2 py-1 text-xs font-medium'>
                {isLockedSkip ? 'Managed in Participants tab' : 'Skipped'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* X button to skip (only when selected and can toggle) */}
      {isSelected && canToggle && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            if (onSkipParticipant) {
              onSkipParticipant(normalizedUuid);
            }
          }}
          className='aucctus-bg-secondary hover:aucctus-bg-tertiary absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full transition-colors'
        >
          <Icon variant='closeX' className='aucctus-stroke-secondary h-4 w-4' />
        </button>
      )}
    </div>
  );
};

const ParticipantSelectionStep: React.FC<IParticipantSelectionStepProps> = ({
  profiles,
  participantCounts,
  skippedParticipants,
  lockedParticipants,
  onParticipantCountChange,
  onSkipParticipant,
  onUnskipParticipant,
  onPersistCountChange,
  isLoading,
  canEditSkip = true,
}) => {
  // Handle card click to toggle selection
  const handleCardClick = useCallback(
    (normalizedUuid: string, isSkipped: boolean, isLockedSkip: boolean) => {
      if (isLockedSkip || !canEditSkip) return;

      if (isSkipped && onUnskipParticipant) {
        onUnskipParticipant(normalizedUuid);
      } else if (!isSkipped && onSkipParticipant) {
        onSkipParticipant(normalizedUuid);
      }
    },
    [canEditSkip, onSkipParticipant, onUnskipParticipant],
  );

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
        const normalizedUuid = normalizeUuid(profile.uuid);
        const count = participantCounts[normalizedUuid] ?? 2;
        const isSkipped = skippedParticipants.has(normalizedUuid);
        const isSelected = !isSkipped && count >= 1;
        const isLockedSkip = lockedParticipants?.has(normalizedUuid) ?? false;
        const canToggle =
          canEditSkip &&
          !isLockedSkip &&
          !!onSkipParticipant &&
          !!onUnskipParticipant;

        return (
          <ParticipantCard
            key={profile.uuid}
            profile={profile}
            count={count}
            isSkipped={isSkipped}
            isSelected={isSelected}
            isLockedSkip={isLockedSkip}
            canToggle={canToggle}
            onCountChange={onParticipantCountChange}
            onPersistCountChange={onPersistCountChange}
            onSkipParticipant={onSkipParticipant}
            onUnskipParticipant={onUnskipParticipant}
            onCardClick={handleCardClick}
          />
        );
      })}
    </div>
  );
};

export default React.memo(ParticipantSelectionStep);

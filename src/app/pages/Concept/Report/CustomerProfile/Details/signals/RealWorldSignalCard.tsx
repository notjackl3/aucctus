import React, { useMemo, useCallback, useState } from 'react';
import { Badge, Icon, Modal } from '@components';
import { ICustomerProfileRealWorldSignal } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import { useCustomerProfileRealWorldSignalDelete } from '@hooks/query/concepts.hook';
import { useModal } from '@context/ModalContextProvider';
import { SignalStanceType } from '@libs/api/types';
// Consolidated style mappings by stance
const stanceStyleMap: Record<
  SignalStanceType,
  {
    bg: string;
    border: string;
    text: string;
  }
> = {
  'In Favour': {
    bg: 'aucctus-bg-success-primary',
    border: 'aucctus-border-success-subtle',
    text: 'aucctus-text-success-primary',
  },
  Against: {
    bg: 'aucctus-bg-error-primary',
    border: 'aucctus-border-error',
    text: 'aucctus-text-error-primary',
  },
  Neutral: {
    bg: 'aucctus-bg-primary',
    border: 'aucctus-border-primary',
    text: 'aucctus-text-primary',
  },
};

interface RealWorldSignalCardProps {
  profileUuid: string;
  signal: ICustomerProfileRealWorldSignal;
}

const RealWorldSignalCard: React.FC<RealWorldSignalCardProps> = ({
  profileUuid,
  signal,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { mutate: deleteSignal, isLoading: isDeleting } =
    useCustomerProfileRealWorldSignalDelete();
  const { openModal, closeModal } = useModal();

  // Memoized values
  const sources = useMemo(() => signal.sources || [], [signal.sources]);
  const stanceStyles = useMemo(
    () =>
      stanceStyleMap[signal.stance as SignalStanceType] ||
      stanceStyleMap['Neutral'],
    [signal.stance],
  );
  const isLoading = useMemo(() => isDeleting, [isDeleting]);

  // Event handlers
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  const handleDeleteSignal = useCallback(() => {
    openModal(Modal.Confirmation, {
      title: `Are you sure you want to delete ${signal.description}?`,
      subtitle: 'This action cannot be undone.',
      actions: [
        {
          title: 'Delete',
          onClick: () => {
            deleteSignal(
              {
                profileUuid,
                signalUuid: signal.uuid,
              },
              {
                onSuccess: closeModal,
              },
            );
          },
          variant: 'warning',
        },
        {
          title: 'Cancel',
          onClick: closeModal,
          variant: 'secondary',
        },
      ],
    });
  }, [deleteSignal, profileUuid, signal, closeModal, openModal]);

  const handleEditSignal = useCallback(() => {
    openModal(
      Modal.EditRealWorldSignal,
      { signal, profileUuid },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
      },
    );
  }, [signal, profileUuid, openModal]);

  return (
    <div
      className={cn(
        'relative flex flex-col gap-2 rounded-lg border border-opacity-50 bg-opacity-25 p-4',
        stanceStyles.bg,
        stanceStyles.border,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header with title and stance badge */}
      <div
        className={cn(
          'flex flex-row items-center gap-2 border-b border-opacity-30 pb-2',
          stanceStyles.border,
        )}
      >
        <span className='aucctus-text-primary aucctus-text-md-semibold'>
          {signal.description}
        </span>
        <span className='flex-1' />
        <Badge.Default
          value={signal.stance}
          classNameBadge={cn(
            'border rounded-lg items-center justify-center',
            stanceStyles.border,
            stanceStyles.bg,
          )}
          classNameLabel={cn(
            'aucctus-text-xs whitespace-nowrap',
            stanceStyles.text,
          )}
        />
      </div>

      {/* Sources with citations */}
      <div className='flex flex-col gap-2'>
        {sources.map((source, index) => (
          <div key={source.url || index} className='flex flex-col gap-1'>
            <Badge.SourceInfo
              source={source}
              badgeSize='small'
              badgeClassName='aucctus-text-primary'
              onClick={() => window.open(source.url, '_blank')}
              showPublishedDate={false}
              sourceDescription={
                index === 0 ? (
                  <div className='aucctus-text-xs aucctus-text-secondary'>
                    {signal.sourceCategory}
                  </div>
                ) : undefined
              }
            />
            {source.description && (
              <blockquote className='aucctus-text-xs aucctus-text-secondary aucctus-border-primary border-l-2 border-opacity-50 pl-2 italic'>
                &ldquo;{source.description}&rdquo;
              </blockquote>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div
        className={cn(
          'mt-2 flex flex-row justify-center gap-4 transition-all duration-300',
          {
            'pointer-events-none opacity-0': !isHovering,
            'pointer-events-auto opacity-100': isHovering,
            hidden: true, // TODO: Remove this once in future once button design is approved
          },
        )}
      >
        <button
          onClick={handleEditSignal}
          className='btn btn-grey border-none !text-primary-900 shadow-none'
          aria-label='Edit signal'
        >
          <Icon variant='edit' className='aucctus-stroke-primary h-4 w-4' />
          Edit
        </button>
        <button
          onClick={handleDeleteSignal}
          className='btn btn-grey border-none !text-primary-900 shadow-none'
          aria-label='Delete signal'
        >
          <Icon
            variant='trash'
            className='aucctus-stroke-error-primary h-4 w-4'
          />
          Delete
        </button>
      </div>

      {/* Loading overlay */}
      <LoadingMask isLoading={isLoading} />
    </div>
  );
};

export default RealWorldSignalCard;

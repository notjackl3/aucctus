import React from 'react';
import { createPortal } from 'react-dom';
import { Icon, toast } from '@components';
import {
  ParticipantChart,
  ParticipantsList,
  useParticipantManagement,
} from './test-participants';
import {
  useRegenerateTestCollateral,
  useUpdateTestParticipant,
} from '@hooks/query/testing.hook';

type PersonaItem = {
  participantUuid: string;
  name: string;
} & Record<string, any>;

interface TestParticipantsProps {
  conceptUuid?: string;
  testUuid?: string;
  // New props for centralized data management
  testDetail?: any | null;
  isCollateralRegenerating?: boolean;
  isSyntheticRunning?: boolean;
}

const TestParticipants: React.FC<TestParticipantsProps> = ({
  conceptUuid,
  testUuid,
  testDetail: propsTestDetail,
  isCollateralRegenerating = false,
  isSyntheticRunning = false,
}) => {
  const {
    // Data
    totalParticipants,
    personaDistribution,
    chartData,

    // Loading states
    isParticipantsLoading,
    isTestDetailLoading,
    isUpdatingTestDetail,
    isUpdatingParticipant,

    // Actions
    handleTotalParticipantsChange,
    handleSubmitTotalParticipants,
    updateParticipantCount,
  } = useParticipantManagement({
    conceptUuid,
    testUuid,
    testDetail: propsTestDetail,
  });

  const updateParticipant = useUpdateTestParticipant();
  const regenerateCollateral = useRegenerateTestCollateral();

  const [dialogParticipant, setDialogParticipant] =
    React.useState<PersonaItem | null>(null);
  const [dialogAction, setDialogAction] = React.useState<
    'skip' | 'unskip' | null
  >(null);

  const isSkipFlowLoading =
    updateParticipant.isLoading || regenerateCollateral.isLoading;
  const disablePersonaActions =
    isUpdatingParticipant || isCollateralRegenerating || isSkipFlowLoading;

  const openWarningDialog = (
    participant: PersonaItem,
    action: 'skip' | 'unskip',
  ) => {
    setDialogParticipant(participant);
    setDialogAction(action);
  };

  const activeParticipantCount = React.useMemo(
    () =>
      (personaDistribution || []).filter((persona) => !persona.isSkipped)
        .length,
    [personaDistribution],
  );

  const handleSkipRequest = (participant: PersonaItem) => {
    if (activeParticipantCount <= 1) {
      toast.error(
        'Cannot Skip All Personas',
        'At least one participant must remain active to regenerate collateral.',
      );
      return;
    }

    openWarningDialog(participant, 'skip');
  };

  const closeWarningDialog = () => {
    setDialogParticipant(null);
    setDialogAction(null);
  };

  const handleConfirmWarning = async () => {
    if (!conceptUuid || !testUuid || !dialogParticipant || !dialogAction) {
      return;
    }

    if (dialogAction === 'skip' && activeParticipantCount <= 1) {
      toast.error(
        'Cannot Skip All Personas',
        'At least one participant must remain active to regenerate collateral.',
      );
      closeWarningDialog();
      return;
    }

    try {
      await updateParticipant.mutateAsync({
        conceptUuid,
        testUuid,
        participantUuid: dialogParticipant.participantUuid,
        data: {
          status: dialogAction === 'skip' ? 'cancelled' : 'invited',
        },
      });

      // Trigger regeneration - WebSocket events will handle loading state
      await regenerateCollateral.mutateAsync({ conceptUuid, testUuid });
    } finally {
      closeWarningDialog();
    }
  };

  if (isParticipantsLoading || isTestDetailLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <Icon
            variant='refresh'
            className='aucctus-stroke-brand-primary h-6 w-6 animate-spin'
          />
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Loading participants...
          </p>
        </div>
      </div>
    );
  }

  // Show no data state if no participants from API
  const hasNoParticipants =
    !personaDistribution || personaDistribution.length === 0;

  const content = hasNoParticipants ? (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-8'>
      <div className='flex flex-col items-center justify-center text-center'>
        <Icon
          variant='users-03'
          className='aucctus-stroke-tertiary mb-4 h-12 w-12'
        />
        <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
          No participants found
        </h4>
        <p className='aucctus-text-sm-regular aucctus-text-secondary max-w-md'>
          Test participants will appear here once they&apos;re added to this
          test. Great testing starts with the right participants from your
          target audience.
        </p>
      </div>
    </div>
  ) : (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      <ParticipantChart
        totalParticipants={totalParticipants}
        chartData={chartData}
        personaDistribution={personaDistribution}
        onTotalParticipantsChange={handleTotalParticipantsChange}
        onSubmitTotalParticipants={handleSubmitTotalParticipants}
        isUpdating={isUpdatingTestDetail}
      />

      <ParticipantsList
        personaDistribution={personaDistribution}
        onUpdateParticipantCount={updateParticipantCount}
        isUpdating={isUpdatingParticipant}
        disableActions={disablePersonaActions}
        onRequestSkip={handleSkipRequest}
        onRequestUnskip={(persona) => openWarningDialog(persona, 'unskip')}
        isSyntheticRunning={isSyntheticRunning}
      />
    </div>
  );

  return (
    <>
      <div className='relative space-y-6'>{content}</div>
      <SkipWarningDialog
        open={!!dialogParticipant}
        participant={dialogParticipant}
        action={dialogAction}
        onCancel={closeWarningDialog}
        onConfirm={handleConfirmWarning}
        isSubmitting={isSkipFlowLoading}
      />
    </>
  );
};

interface SkipWarningDialogProps {
  open: boolean;
  participant: PersonaItem | null;
  action: 'skip' | 'unskip' | null;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const SkipWarningDialog: React.FC<SkipWarningDialogProps> = ({
  open,
  participant,
  action,
  onCancel,
  onConfirm,
  isSubmitting,
}) => {
  if (!open || !participant || !action || typeof document === 'undefined') {
    return null;
  }

  const isSkip = action === 'skip';
  const title = isSkip
    ? `Skip ${participant.name}?`
    : `Unskip ${participant.name}?`;
  const body = isSkip
    ? 'This persona will be removed from your next collateral pass.'
    : 'This persona will be included again in regenerated collateral.';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCancel();
  };

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onConfirm();
  };

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4'
      onClick={handleBackdropClick}
      data-aucctus-portal-target='true'
    >
      <div
        className='aucctus-bg-primary w-full max-w-lg rounded-xl p-6 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='text-left'>
          <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
            {title}
          </h3>
          <p className='aucctus-text-sm-regular aucctus-text-secondary mt-1'>
            {body}
          </p>
          <ul className='aucctus-text-sm-regular aucctus-text-secondary mt-3 list-disc space-y-1 pl-5'>
            <li>
              Only your collateral will refresh and the new one will show
              updated participant mix.
            </li>
            <li>
              Your test details, results, and recommendations stay unchanged.
            </li>
          </ul>
        </div>
        <div className='mt-6 flex items-center justify-end gap-3'>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type='button'
            className='btn btn-primary'
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TestParticipants;

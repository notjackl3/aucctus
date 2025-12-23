import React from 'react';
import { Icon } from '@components';
import {
  ParticipantChart,
  ParticipantsList,
  useParticipantManagement,
} from './test-participants';
import TabBanner from '../common/TabBanner';

interface TestParticipantsProps {
  conceptUuid?: string;
  testUuid?: string;
  // New props for centralized data management
  testDetail?: any | null;
  isCollateralRegenerating?: boolean;
  isSyntheticRunning?: boolean;
  isActive?: boolean;
}

const TestParticipants: React.FC<TestParticipantsProps> = ({
  conceptUuid,
  testUuid,
  testDetail: propsTestDetail,
  isCollateralRegenerating = false,
  isSyntheticRunning = false,
  isActive = false,
}) => {
  const {
    // Data
    totalParticipants,
    personaDistribution,
    chartData,

    // Loading states
    isParticipantsLoading,
    isTestDetailLoading,
    isUpdatingParticipant,

    // Actions
    updateParticipantCount,
  } = useParticipantManagement({
    conceptUuid,
    testUuid,
    testDetail: propsTestDetail,
  });

  const disablePersonaActions =
    isUpdatingParticipant || isCollateralRegenerating || isSyntheticRunning;

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
    <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
      {/* Left Column - Personas List - 3/5 width */}
      <div className='lg:col-span-3'>
        <ParticipantsList
          personaDistribution={personaDistribution}
          onUpdateParticipantCount={updateParticipantCount}
          isUpdating={isUpdatingParticipant}
          disableActions={disablePersonaActions}
          maxParticipants={totalParticipants}
        />
      </div>

      {/* Right Column - Donut Chart - 2/5 width */}
      <div className='lg:col-span-2'>
        {isActive && <ParticipantChart chartData={chartData} />}
      </div>
    </div>
  );

  return (
    <div className='space-y-4 overscroll-contain'>
      <TabBanner
        icon='users-03'
        title='Select Participants'
        description='Choose which customer personas to include in your test and how many of each.'
      />
      {content}
    </div>
  );
};

export default TestParticipants;

import React from 'react';
import { Icon } from '@components';
import {
  ParticipantChart,
  ParticipantsList,
  useParticipantManagement,
} from './test-participants';

interface TestParticipantsProps {
  conceptUuid?: string;
  testUuid?: string;
  // New props for centralized data management
  testDetail?: any | null;
}

const TestParticipants: React.FC<TestParticipantsProps> = ({
  conceptUuid,
  testUuid,
  testDetail: propsTestDetail,
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

  return (
    <div className='relative space-y-6'>
      {hasNoParticipants ? (
        // No data state
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
        // Data available state
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Left Column - Donut Chart */}
          <ParticipantChart
            totalParticipants={totalParticipants}
            chartData={chartData}
            personaDistribution={personaDistribution}
            onTotalParticipantsChange={handleTotalParticipantsChange}
            onSubmitTotalParticipants={handleSubmitTotalParticipants}
            isUpdating={isUpdatingTestDetail}
          />

          {/* Right Column - Personas to Target */}
          <ParticipantsList
            personaDistribution={personaDistribution}
            onUpdateParticipantCount={updateParticipantCount}
            isUpdating={isUpdatingParticipant}
          />
        </div>
      )}
    </div>
  );
};

export default TestParticipants;

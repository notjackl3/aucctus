import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@components';
import {
  useTestParticipants,
  useUpdateTestDetail,
  useTestDetail,
  useUpdateTestParticipant,
} from '@hooks/query/testing.hook';
import defaultAvatar from '@assets/img/avatar.png';
import { cn } from '@libs/utils/react';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

interface TestParticipantsProps {
  conceptUuid?: string;
  testUuid?: string;
  // New props for centralized data management
  testDetail?: any | null;
}

// Colors for the donut chart segments
const COLORS = ['#FF8A00', '#00C853', '#00B0FF', '#AA00FF'];

const TestParticipants: React.FC<TestParticipantsProps> = ({
  conceptUuid,
  testUuid,
  testDetail: propsTestDetail,
}) => {
  const queryClient = useQueryClient();

  // Use props data if available, otherwise fetch (for backward compatibility)
  const shouldFetch = !!conceptUuid && !!testUuid;

  const {
    participants: fetchedParticipants,
    isLoading: isFetchedParticipantsLoading,
  } = useTestParticipants(conceptUuid || '', testUuid || '', {
    enabled: shouldFetch,
  });

  const {
    testDetail: fetchedTestDetail,
    isLoading: isFetchedTestDetailLoading,
  } = useTestDetail(
    shouldFetch ? conceptUuid || '' : '',
    shouldFetch ? testUuid || '' : '',
  );

  // Use provided data or fallback to fetched data
  const participants = fetchedParticipants;
  const testDetail = propsTestDetail || fetchedTestDetail;
  const isParticipantsLoading = isFetchedParticipantsLoading;
  const isTestDetailLoading = isFetchedTestDetailLoading;

  // Hook for updating test details
  const updateTestDetail = useUpdateTestDetail();

  // Hook for updating test participants
  const updateTestParticipant = useUpdateTestParticipant();

  const [totalParticipants, setTotalParticipants] = useState(0);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<
    string | null
  >(null);
  const [editingValue, setEditingValue] = useState<number>(0);

  // Initialize totalParticipants from test detail's targetParticipants
  useEffect(() => {
    if (testDetail?.targetParticipants !== undefined) {
      setTotalParticipants(testDetail.targetParticipants);
    }
  }, [testDetail]);

  // Calculate persona distribution from participants
  const { personaDistribution, chartData } = useMemo(() => {
    if (!participants || participants.length === 0) {
      return { personaDistribution: [], chartData: [] };
    }

    const personas = participants.map((participant, index) => ({
      id: participant.uuid,
      name: participant.customerProfile.name,
      segment: participant.customerProfile.segment,
      description: participant.customerProfile.description,
      avatar: participant.customerProfile.avatarUrl,
      count: participant.count,
      ratio: Math.round(participant.ratioPercentage),
      status: participant.status,
      isPrimary: participant.customerProfile.isPrimary,
      geoLocation: participant.customerProfile.geoLocation,
      ageRange: participant.customerProfile.ageRange,
      incomeRange: participant.customerProfile.incomeRange,
      occupation: participant.customerProfile.occupation,
      notes: participant.notes,
      color: COLORS[index % COLORS.length],
    }));

    const chartData = personas
      .filter((p) => p.count > 0)
      .map((persona) => ({
        name: persona.segment,
        value: persona.count,
        ratio: persona.ratio,
        id: persona.id,
      }));

    return { personaDistribution: personas, chartData };
  }, [participants]);

  // Handle total participants change
  const handleTotalParticipantsChange = (newValue: number) => {
    if (newValue < 0) {
      newValue = 0;
    }
    setTotalParticipants(newValue);
  };

  // Submit total participants update
  const handleSubmitTotalParticipants = async () => {
    if (!conceptUuid || !testUuid) {
      return;
    }

    try {
      await updateTestDetail.mutateAsync({
        conceptUuid,
        testUuid,
        data: {
          targetParticipants: totalParticipants,
        },
      });

      // Additional query invalidation to ensure parent components refresh
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testDetails, conceptUuid],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testDetail, conceptUuid, testUuid],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testParticipants, conceptUuid, testUuid],
        }),
      ]);

      // Close edit mode on success
      setIsEditingTotal(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating target participants:', error);
      // The mutation hook will handle showing the error toast
    }
  };

  // Start editing a participant count
  const startEditingParticipant = (
    participantId: string,
    currentCount: number,
  ) => {
    setEditingParticipantId(participantId);
    setEditingValue(currentCount);
  };

  // Cancel editing
  const cancelEditingParticipant = () => {
    setEditingParticipantId(null);
    setEditingValue(0);
  };

  // Update participant count via API using proper mutation hook
  const updateParticipantCount = async (
    participantId: string,
    newCount: number,
  ) => {
    if (newCount < 0) {
      newCount = 0;
    }

    if (!conceptUuid || !testUuid) {
      return;
    }

    try {
      await updateTestParticipant.mutateAsync({
        conceptUuid,
        testUuid,
        participantUuid: participantId,
        data: {
          count: newCount,
        },
      });

      // Additional query invalidation to ensure all related data refreshes
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testDetails, conceptUuid],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testDetail, conceptUuid, testUuid],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.testParticipants, conceptUuid, testUuid],
        }),
      ]);

      // Reset editing state only after successful update
      setEditingParticipantId(null);
      setEditingValue(0);
    } catch (error) {
      // Error handling is done by the mutation hook (shows toast)
      // Error details are logged by the mutation hook
    }
  };

  // Handle submit for participant count edit
  const handleSubmitParticipantEdit = () => {
    if (editingParticipantId) {
      updateParticipantCount(editingParticipantId, editingValue);
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
  const hasNoParticipants = !participants || participants.length === 0;

  return (
    <div className='relative space-y-6'>
      {/* Header Section */}
      <div className='space-y-2'>
        <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary'>
          Test Participants
        </h3>
        <p className='aucctus-text-sm-regular aucctus-text-secondary'>
          Manage participants for your test
          {!hasNoParticipants && (
            <span className='aucctus-text-brand-primary ml-2'>
              ({participants.length} participant group
              {participants.length !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

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
          <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                Who to engage
              </h4>
              {isEditingTotal ? (
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    className='aucctus-border-secondary aucctus-text-sm w-20 rounded border p-2 text-center'
                    value={totalParticipants}
                    onChange={(e) =>
                      handleTotalParticipantsChange(
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min={0}
                    autoFocus
                    disabled={updateTestDetail.isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitTotalParticipants();
                      } else if (e.key === 'Escape') {
                        setIsEditingTotal(false);
                      }
                    }}
                  />
                  <button
                    className='btn btn-success btn-sm'
                    onClick={handleSubmitTotalParticipants}
                    disabled={updateTestDetail.isLoading}
                  >
                    {updateTestDetail.isLoading ? (
                      <Icon
                        variant='refresh'
                        className='aucctus-stroke-white h-4 w-4 animate-spin'
                      />
                    ) : (
                      <Icon
                        variant='check'
                        className='aucctus-stroke-white h-4 w-4'
                      />
                    )}
                  </button>
                  <button
                    className='btn btn-secondary btn-sm'
                    onClick={() => setIsEditingTotal(false)}
                    disabled={updateTestDetail.isLoading}
                  >
                    <Icon
                      variant='closeX'
                      className='aucctus-stroke-secondary h-4 w-4'
                    />
                  </button>
                </div>
              ) : (
                <button
                  className='btn btn-secondary btn-sm flex items-center gap-1'
                  onClick={() => setIsEditingTotal(true)}
                >
                  <Icon
                    variant='edit'
                    className='aucctus-stroke-secondary h-4 w-4'
                  />
                  Edit
                </button>
              )}
            </div>

            {/* Donut Chart Area */}
            <div className='relative mb-6 flex h-72 flex-col items-center justify-center'>
              {/* SVG Donut Chart */}
              <div className='relative'>
                <svg width='200' height='200' className='-rotate-90 transform'>
                  <circle
                    cx='100'
                    cy='100'
                    r='80'
                    fill='none'
                    stroke='#f1f5f9'
                    strokeWidth='20'
                  />
                  {chartData.map((segment, index) => {
                    const circumference = 2 * Math.PI * 80;
                    const strokeDasharray =
                      (segment.value / totalParticipants) * circumference;
                    const rotation = chartData
                      .slice(0, index)
                      .reduce(
                        (acc, prev) =>
                          acc + (prev.value / totalParticipants) * 360,
                        0,
                      );

                    return (
                      <circle
                        key={segment.id}
                        cx='100'
                        cy='100'
                        r='80'
                        fill='none'
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth='20'
                        strokeDasharray={`${strokeDasharray} ${circumference}`}
                        strokeDashoffset='0'
                        style={{
                          transformOrigin: '100px 100px',
                          transform: `rotate(${rotation}deg)`,
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Center Total */}
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <div className='aucctus-text-2xl-bold aucctus-text-brand-primary'>
                      {totalParticipants}
                    </div>
                    <div className='aucctus-text-xs-regular aucctus-text-secondary'>
                      Total
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              {personaDistribution.length > 0 && (
                <div className='mt-4 grid w-full grid-cols-2 gap-3'>
                  {personaDistribution
                    .filter((p) => p.count > 0)
                    .map((persona, personaIndex) => (
                      <div key={persona.id} className='flex items-center gap-2'>
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{
                            backgroundColor:
                              COLORS[personaIndex % COLORS.length],
                          }}
                        />
                        <span className='aucctus-text-xs-regular aucctus-text-secondary truncate'>
                          {persona.segment.split(' ')[0]}
                        </span>
                        <span className='aucctus-text-xs-semibold aucctus-text-brand-primary'>
                          {persona.count}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className='aucctus-bg-secondary-subtle rounded-lg p-4'>
              <h5 className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-2'>
                Number of participants
              </h5>
              <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                For customer interviews, a panel size of up to 20 respondents is
                recommended for qualitative insights.
              </p>
            </div>
          </div>

          {/* Right Column - Personas to Target */}
          <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                Personas to target
              </h4>
            </div>

            <div className='max-h-[450px] space-y-4 overflow-auto pr-1'>
              {personaDistribution.map((persona) => (
                <div
                  key={persona.id}
                  className='aucctus-border-secondary aucctus-bg-secondary-subtle rounded-lg border p-4'
                >
                  {/* Persona Header */}
                  <div className='mb-3 flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      {/* Color indicator */}
                      <div
                        className='h-3 w-3 rounded-full'
                        style={{ backgroundColor: persona.color }}
                      />

                      {/* Avatar */}
                      <img
                        className='aucctus-border-secondary h-10 w-10 rounded-full border object-cover'
                        alt={persona.name}
                        src={persona.avatar || defaultAvatar}
                      />

                      {/* Name and Segment */}
                      <div>
                        <div className='flex items-center gap-2'>
                          <h5 className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                            {persona.name}
                          </h5>
                          {persona.isPrimary && (
                            <span className='aucctus-bg-brand-secondary aucctus-text-brand-tertiary flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'>
                              <Icon
                                variant='briefcase'
                                height={10}
                                width={10}
                                className='aucctus-stroke-brand-primary'
                              />
                              Primary
                            </span>
                          )}
                        </div>
                        <span className='aucctus-text-xs-regular aucctus-text-secondary'>
                          {persona.segment}
                        </span>
                      </div>
                    </div>

                    {/* Count and Ratio Controls */}
                    <div className='flex items-center gap-3'>
                      <div className='aucctus-text-xs-semibold aucctus-text-tertiary aucctus-bg-secondary rounded px-2 py-1'>
                        {persona.ratio}%
                      </div>

                      {/* Editable Count Section */}
                      {editingParticipantId === persona.id ? (
                        <div className='flex items-center gap-2'>
                          <input
                            type='number'
                            className='aucctus-border-secondary aucctus-text-sm w-16 rounded border p-1 text-center'
                            value={editingValue}
                            onChange={(e) =>
                              setEditingValue(parseInt(e.target.value) || 0)
                            }
                            min={0}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSubmitParticipantEdit();
                              } else if (e.key === 'Escape') {
                                cancelEditingParticipant();
                              }
                            }}
                          />
                          <button
                            className='btn btn-success btn-xs'
                            onClick={handleSubmitParticipantEdit}
                            disabled={updateTestParticipant.isLoading}
                          >
                            <Icon
                              variant='check'
                              className='aucctus-stroke-white h-3 w-3'
                            />
                          </button>
                          <button
                            className='btn btn-secondary btn-xs'
                            onClick={cancelEditingParticipant}
                            disabled={updateTestParticipant.isLoading}
                          >
                            <Icon
                              variant='closeX'
                              className='aucctus-stroke-secondary h-3 w-3'
                            />
                          </button>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <span className='aucctus-text-sm-semibold aucctus-text-brand-primary px-3 py-1'>
                            {persona.count}
                          </span>
                          <button
                            className='btn btn-secondary btn-xs'
                            onClick={() =>
                              startEditingParticipant(persona.id, persona.count)
                            }
                            disabled={updateTestParticipant.isLoading}
                          >
                            <Icon
                              variant='edit'
                              className='aucctus-stroke-secondary h-3 w-3'
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Persona Details */}
                  <div className='space-y-2'>
                    <p className='aucctus-text-sm-regular aucctus-text-secondary line-clamp-2'>
                      {persona.description}
                    </p>

                    {/* Demographics */}
                    <div className='flex flex-wrap gap-4 text-xs'>
                      <div className='flex items-center gap-1'>
                        <Icon
                          variant='globe'
                          className='aucctus-stroke-tertiary h-3 w-3'
                        />
                        <span className='aucctus-text-tertiary'>
                          {persona.geoLocation}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Icon
                          variant='calendar'
                          className='aucctus-stroke-tertiary h-3 w-3'
                        />
                        <span className='aucctus-text-tertiary'>
                          {persona.ageRange}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Icon
                          variant='briefcase'
                          className='aucctus-stroke-tertiary h-3 w-3'
                        />
                        <span className='aucctus-text-tertiary'>
                          {persona.occupation}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className='flex items-center justify-between'>
                      <span
                        className={cn(
                          'aucctus-text-xs-semibold rounded-full px-2 py-1',
                          persona.status === 'confirmed'
                            ? 'aucctus-bg-success-secondary aucctus-text-success-primary'
                            : persona.status === 'invited'
                              ? 'aucctus-bg-warning-secondary aucctus-text-warning-primary'
                              : 'aucctus-bg-secondary aucctus-text-tertiary',
                        )}
                      >
                        {persona.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestParticipants;

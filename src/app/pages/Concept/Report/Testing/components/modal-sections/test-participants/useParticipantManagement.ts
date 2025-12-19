import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import {
  useTestParticipants,
  useUpdateTestDetail,
  useTestDetail,
  useUpdateTestParticipant,
} from '@hooks/query/testing.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

// Colors for the donut chart segments
const COLORS = ['#FF8A00', '#00C853', '#00B0FF', '#AA00FF'];

interface UseParticipantManagementProps {
  conceptUuid?: string;
  testUuid?: string;
  testDetail?: any | null;
}

export const useParticipantManagement = ({
  conceptUuid,
  testUuid,
  testDetail: propsTestDetail,
}: UseParticipantManagementProps) => {
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

  // Default to 20 participants max - this ensures users can always select participants
  // even for new tests that don't have targetParticipants set yet
  const DEFAULT_MAX_PARTICIPANTS = 20;

  const [totalParticipants, setTotalParticipants] = useState(
    DEFAULT_MAX_PARTICIPANTS,
  );

  // Initialize totalParticipants from test detail's targetParticipants
  // Only use the API value if it's a positive number; otherwise keep the default
  useEffect(() => {
    if (testDetail?.targetParticipants && testDetail.targetParticipants > 0) {
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
      participantUuid: participant.uuid,
      profileUuid: participant.customerProfile.uuid,
      name: participant.customerProfile.name,
      segment: participant.customerProfile.segment,
      description: participant.customerProfile.description,
      avatar: participant.customerProfile.avatarUrl,
      count: participant.count,
      ratio: Math.round(participant.ratioPercentage),
      status: participant.status,
      isSkipped: participant.status === 'cancelled',
      isPrimary: participant.customerProfile.isPrimary,
      geoLocation: participant.customerProfile.geoLocation,
      ageRange: participant.customerProfile.ageRange,
      incomeRange: participant.customerProfile.incomeRange,
      occupation: participant.customerProfile.occupation,
      notes: participant.notes,
      color: COLORS[index % COLORS.length],
    }));

    const chartData = personas
      .filter((p) => p.count > 0 && !p.isSkipped)
      .map((persona) => ({
        name: persona.name,
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
    } catch (error) {
      // The mutation hook will handle showing the error toast
      // Error is logged via the mutation hook's error handling
    }
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
    } catch (error) {
      // Error handling is done by the mutation hook (shows toast)
      // Error details are logged by the mutation hook
    }
  };

  return {
    // Data
    participants,
    testDetail,
    totalParticipants,
    personaDistribution,
    chartData,

    // Loading states
    isParticipantsLoading,
    isTestDetailLoading,
    isUpdatingTestDetail: updateTestDetail.isLoading,
    isUpdatingParticipant: updateTestParticipant.isLoading,

    // Actions
    handleTotalParticipantsChange,
    handleSubmitTotalParticipants,
    updateParticipantCount,
  };
};

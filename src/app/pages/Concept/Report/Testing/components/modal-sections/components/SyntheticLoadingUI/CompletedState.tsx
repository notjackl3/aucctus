import { ICustomerProfile } from '@libs/api/types/concept/concepts';
import { useTestResults } from '@hooks/query/testing.hook';
import React, { useMemo } from 'react';
import { CompletedInterviewItem } from './CompletedInterviewItem';
import { FileUp } from 'lucide-react';

interface CompletedStateProps {
  profiles: ICustomerProfile[];
  resultsCount?: number;
  conceptUuid?: string;
  testUuid?: string;
  plannedParticipantCounts?: Record<string, number>;
  onViewResults?: () => void;
}

export const CompletedState: React.FC<CompletedStateProps> = ({
  profiles,
  resultsCount,
  conceptUuid,
  testUuid,
  plannedParticipantCounts,
  onViewResults,
}) => {
  const shouldFetchResults = Boolean(conceptUuid && testUuid);
  const { results: fetchedResults } = useTestResults(
    conceptUuid || '',
    testUuid || '',
    { enabled: shouldFetchResults },
  );

  const normalizeUuid = (value?: string | null) =>
    value ? value.replace(/_/g, '-').toLowerCase() : undefined;

  const normalizeName = (value?: string | null) =>
    value
      ? value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .toLowerCase()
      : undefined;

  const plannedCounts = useMemo(() => {
    if (!plannedParticipantCounts) {
      return { counts: new Map<string, number>(), total: 0 };
    }

    const validProfileIds = new Set(
      profiles.map(
        (profile) => normalizeUuid(profile.uuid) ?? profile.uuid.toLowerCase(),
      ),
    );

    const counts = new Map<string, number>();
    Object.entries(plannedParticipantCounts).forEach(([uuid, count]) => {
      if (!count || count <= 0) {
        return;
      }
      const normalizedUuid = normalizeUuid(uuid) ?? uuid.toLowerCase();
      if (!validProfileIds.has(normalizedUuid)) {
        return;
      }
      counts.set(normalizedUuid, count);
    });

    const total = Array.from(counts.values()).reduce(
      (sum, value) => sum + value,
      0,
    );

    return { counts, total };
  }, [plannedParticipantCounts, profiles]);

  const profileCounts = useMemo(() => {
    const counts = new Map<string, number>();

    profiles.forEach((profile) => {
      const normalizedUuid =
        normalizeUuid(profile.uuid) ?? profile.uuid.toLowerCase();
      counts.set(normalizedUuid, 0);
    });

    const syntheticResults = (fetchedResults || []).filter(
      (result) => result.isSynthetic,
    );

    syntheticResults.forEach((result) => {
      const candidateIds = [
        normalizeUuid(result.baseProfileUuid),
        normalizeUuid(result.personaUuid),
      ]
        .filter(Boolean)
        .map((id) => id as string);

      let matched = false;
      for (const candidate of candidateIds) {
        if (counts.has(candidate)) {
          counts.set(candidate, (counts.get(candidate) || 0) + 1);
          matched = true;
          break;
        }
      }

      if (!matched && result.personaName) {
        const personaName = normalizeName(result.personaName);
        const matchingProfile = profiles.find(
          (profile) => normalizeName(profile.name) === personaName,
        );

        if (matchingProfile) {
          const normalizedProfileUuid =
            normalizeUuid(matchingProfile.uuid) ??
            matchingProfile.uuid.toLowerCase();
          counts.set(
            normalizedProfileUuid,
            (counts.get(normalizedProfileUuid) || 0) + 1,
          );
        }
      }
    });

    const total = Array.from(counts.values()).reduce(
      (sum, value) => sum + value,
      0,
    );

    const syntheticResultsCount = syntheticResults.length;

    return {
      counts,
      total,
      hasResults: syntheticResults.length > 0,
      syntheticResultsCount,
    };
  }, [fetchedResults, profiles]);

  const hasCompleteResultData =
    profileCounts.hasResults &&
    profileCounts.total > 0 &&
    (typeof resultsCount !== 'number' ||
      resultsCount === profileCounts.syntheticResultsCount);

  const totalResponses = hasCompleteResultData
    ? profileCounts.total
    : plannedCounts.total > 0
      ? plannedCounts.total
      : resultsCount || profiles.length;

  return (
    <div className='space-y-6'>
      {/* Success Card */}
      <div className='aucctus-bg-success-subtle aucctus-border-success-subtle overflow-hidden rounded-xl border shadow-sm'>
        <div className='border-l-4 border-l-green-500'>
          <div className='p-8 text-center'>
            <h2 className='aucctus-text-primary mb-2 text-3xl font-bold'>
              Synthetic Test Complete!
            </h2>
            <p className='aucctus-text-secondary aucctus-text-lg mb-6'>
              Successfully interviewed {totalResponses} synthetic participants
            </p>

            <button
              className='btn btn-primary btn-lg inline-flex items-center gap-2'
              onClick={onViewResults}
            >
              <FileUp className='aucctus-stroke-white h-5 w-5' />
              View Results
            </button>
          </div>
        </div>
      </div>

      {/* Completed Interviews Grid */}
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
        <div className='p-6'>
          <h3 className='aucctus-text-primary mb-4 text-lg font-semibold'>
            Completed Interviews
          </h3>

          <div className='grid grid-cols-2 gap-4'>
            {profiles.map((profile, index) => {
              const normalizedUuid =
                normalizeUuid(profile.uuid) ?? profile.uuid.toLowerCase();
              const actualCount = profileCounts.counts.get(normalizedUuid) ?? 0;
              const plannedCount =
                plannedCounts.counts.get(normalizedUuid) ?? 0;

              const fallbackTotal =
                totalResponses && profiles.length > 0
                  ? Math.floor(totalResponses / profiles.length)
                  : 0;
              const fallbackRemainder =
                totalResponses && profiles.length > 0
                  ? totalResponses % profiles.length
                  : 0;
              const fallbackCount =
                fallbackTotal + (index < fallbackRemainder ? 1 : 0);

              const displayCount =
                hasCompleteResultData && actualCount > 0
                  ? actualCount
                  : plannedCount > 0
                    ? plannedCount
                    : fallbackCount;

              return (
                <CompletedInterviewItem
                  key={profile.uuid}
                  profile={profile}
                  completedCount={displayCount}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats - Separate Cards */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4 text-center'>
          <div className='aucctus-text-brand-primary text-2xl font-bold'>
            {profiles.length}
          </div>
          <div className='aucctus-text-secondary aucctus-text-sm'>
            Participants
          </div>
        </div>
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4 text-center'>
          <div className='aucctus-text-brand-primary text-2xl font-bold'>
            {totalResponses}
          </div>
          <div className='aucctus-text-secondary aucctus-text-sm'>
            Responses
          </div>
        </div>
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4 text-center'>
          <div className='aucctus-text-brand-primary text-2xl font-bold'>
            100%
          </div>
          <div className='aucctus-text-secondary aucctus-text-sm'>Complete</div>
        </div>
      </div>
    </div>
  );
};

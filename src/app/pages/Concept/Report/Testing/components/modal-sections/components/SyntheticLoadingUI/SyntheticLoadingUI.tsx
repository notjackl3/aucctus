import React, { useMemo } from 'react';
import { ISyntheticLoadingUIProps, IPersonaProgressItem } from './types';
import { RunningTestCard } from './RunningTestCard';
import { InterviewProgressCard } from './InterviewProgressCard';
import { CompletedState } from './CompletedState';

const SyntheticLoadingUI: React.FC<ISyntheticLoadingUIProps> = ({
  progress = 0,
  status,
  message,
  currentStage,
  profiles,
  resultsCount,
  isInitializing = false,
  quotes = [],
  completedProfileUuids,
  estimatedSeconds,
  startTime,
  conceptUuid,
  testUuid,
  testName,
  plannedParticipantCounts,
  onViewResults,
}) => {
  // Calculate persona progress using completed profile UUIDs from WebSocket events
  const personaProgress = useMemo((): IPersonaProgressItem[] => {
    if (!profiles.length) return [];

    return profiles.map((profile) => {
      let itemStatus: 'pending' | 'processing' | 'completed' = 'pending';

      if (status === 'completed') {
        // All profiles are completed when test is done
        itemStatus = 'completed';
      } else if (status === 'running') {
        // Check if this specific profile has been marked as completed
        if (completedProfileUuids?.has(profile.uuid)) {
          itemStatus = 'completed';
        } else {
          // All non-completed profiles are actively processing in parallel
          itemStatus = 'processing';
        }
      }

      return {
        profile,
        status: itemStatus,
      };
    });
  }, [profiles, status, completedProfileUuids]);

  // Calculate current participant index based on completed profiles
  const currentParticipantIndex = useMemo(() => {
    if (!profiles.length || status !== 'running') return undefined;

    // Find the first non-completed profile
    for (let i = 0; i < profiles.length; i++) {
      if (!completedProfileUuids?.has(profiles[i].uuid)) {
        return i;
      }
    }
    // All completed, return last index
    return profiles.length - 1;
  }, [profiles, completedProfileUuids, status]);

  if (status === 'completed') {
    return (
      <CompletedState
        profiles={profiles}
        resultsCount={resultsCount}
        conceptUuid={conceptUuid}
        testUuid={testUuid}
        plannedParticipantCounts={plannedParticipantCounts}
        onViewResults={onViewResults}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Running Synthetic Test Card */}
      <RunningTestCard
        progress={progress}
        message={message}
        currentStage={currentStage}
        isInitializing={isInitializing}
        conceptUuid={conceptUuid}
        numProfiles={profiles.length}
        estimatedSeconds={estimatedSeconds}
        startTime={startTime}
        testName={testName}
      />

      {/* Interview Progress Card */}
      <InterviewProgressCard
        personaProgress={personaProgress}
        quotes={quotes}
        currentParticipantIndex={currentParticipantIndex}
      />

      {/* Live Responses Section */}
      {quotes.length > 0 && (
        <div className='space-y-3'>
          <h3 className='aucctus-text-primary text-center text-lg font-semibold'>
            Live Responses
          </h3>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {quotes.map((quote, index) => (
              <div
                key={`${quote.profileUuid}-${index}`}
                className='aucctus-bg-primary aucctus-border-secondary animate-fade-in rounded-lg border p-3 shadow-sm'
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <p className='aucctus-text-secondary aucctus-text-sm'>
                  &ldquo;{quote.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SyntheticLoadingUI);

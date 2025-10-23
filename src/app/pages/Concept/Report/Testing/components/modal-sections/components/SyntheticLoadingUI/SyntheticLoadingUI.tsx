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

  if (status === 'completed') {
    return (
      <CompletedState
        profiles={profiles}
        resultsCount={resultsCount}
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
      />

      {/* Interview Progress Card */}
      <InterviewProgressCard
        personaProgress={personaProgress}
        quotes={quotes}
      />
    </div>
  );
};

export default React.memo(SyntheticLoadingUI);

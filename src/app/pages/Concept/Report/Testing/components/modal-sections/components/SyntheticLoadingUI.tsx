import { Icon } from '@components';
import { ICustomerProfile } from '@libs/api/types/concept/concepts';
import { cn } from '@libs/utils/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface ISyntheticLoadingUIProps {
  // Progress data
  progress?: number; // Made optional to handle initialization state
  status: 'running' | 'completed' | 'error' | 'cancelled';
  message?: string;
  currentStage?: string;

  // Customer profiles for interview progress
  profiles: ICustomerProfile[];
  currentPersona?: string;
  totalPersonas?: number;

  // Results data for completion state
  resultsCount?: number;

  // Initialization state
  isInitializing?: boolean;

  // Navigation callback
  onViewResults?: () => void;
}

interface IPersonaProgressItem {
  profile: ICustomerProfile;
  status: 'pending' | 'processing' | 'completed';
}

const SyntheticLoadingUI: React.FC<ISyntheticLoadingUIProps> = ({
  progress = 0,
  status,
  message,
  currentStage,
  profiles,
  resultsCount,
  isInitializing = false,
  onViewResults,
}) => {
  // Hybrid pulsing system - combines timer-based and real progress-based pulsing
  const [currentPulsingIndex, setCurrentPulsingIndex] = useState(0);
  const [completedProfiles, setCompletedProfiles] = useState<Set<number>>(
    new Set(),
  );
  const [pulsingStageBehavior, setPulsingStageBehavior] = useState<
    'timer' | 'real'
  >('timer');

  // Helper function to extract person name from backend messages
  const extractPersonNameFromMessage = (message: string): string | null => {
    // Extract from messages like "Analyzing Synthetic_Interview_Maya_Thompson.pdf (1/1)..."
    const match = message.match(/Synthetic_Interview_(.+?)\.pdf/);
    if (match) {
      return match[1].replace(/_/g, ' '); // Convert "Maya_Thompson" to "Maya Thompson"
    }
    return null;
  };

  // Helper function to normalize names for comparison
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[áéíóúñü]/g, (char) => {
        const map: Record<string, string> = {
          á: 'a',
          é: 'e',
          í: 'i',
          ó: 'o',
          ú: 'u',
          ñ: 'n',
          ü: 'u',
        };
        return map[char] || char;
      })
      .trim();
  };

  // Helper function to find profile index by name
  const findProfileIndexByName = useCallback(
    (personName: string): number => {
      const normalizedPersonName = normalizeName(personName);

      return profiles.findIndex((profile) => {
        // Try multiple profile fields and normalize them for comparison
        const profileNames = [
          profile.segment,
          profile.name,
          // Also try just first name + last name if segment is longer
          profile.segment?.split(' ').slice(0, 2).join(' '),
        ].filter(Boolean);

        return profileNames.some(
          (profileName) =>
            normalizeName(profileName || '') === normalizedPersonName,
        );
      });
    },
    [profiles],
  );

  // Handle stage-specific pulsing behavior
  useEffect(() => {
    if (status !== 'running' || profiles.length === 0) {
      return;
    }

    // Determine pulsing behavior based on current stage
    if (currentStage === 'processing_files' && message) {
      // Stage 2: Real progress-based pulsing
      setPulsingStageBehavior('real');

      const personName = extractPersonNameFromMessage(message);
      if (personName) {
        const profileIndex = findProfileIndexByName(personName);

        if (profileIndex !== -1) {
          // Mark previous profiles as completed and set current one as pulsing
          setCompletedProfiles(
            new Set(Array.from({ length: profileIndex }, (_, i) => i)),
          );
          setCurrentPulsingIndex(profileIndex);
        }
      }
    } else if (
      currentStage === 'extracting_findings' ||
      currentStage === 'generating_findings' ||
      currentStage === 'finalizing_results'
    ) {
      // Stage 3: Keep last profile from Stage 2 pulsing (don't change current state)
      setPulsingStageBehavior('timer');
      // Don't reset currentPulsingIndex - it should stay on the last profile from Stage 2
    } else {
      // Stage 1: Timer-based pulsing
      setPulsingStageBehavior('timer');
    }
  }, [currentStage, message, profiles, status, findProfileIndexByName]);

  // Timer-based pulsing setup (for Stage 1 and Stage 3)
  useEffect(() => {
    if (
      status !== 'running' ||
      profiles.length === 0 ||
      pulsingStageBehavior === 'real'
    ) {
      return;
    }

    if (
      currentStage?.startsWith('generating_') ||
      currentStage === 'initializing'
    ) {
      // Stage 1: Keep first profile pulsing
      setCurrentPulsingIndex(0);
      setCompletedProfiles(new Set());
    } else if (
      currentStage === 'extracting_findings' ||
      currentStage === 'generating_findings' ||
      currentStage === 'finalizing_results'
    ) {
      // Stage 3: Keep the last profile from Stage 2 pulsing
      // Don't change currentPulsingIndex - it should already be set to the last profile from Stage 2
      // This ensures Aisha (or whoever was last) continues pulsing
    }
  }, [status, profiles.length, pulsingStageBehavior, currentStage]);

  // Calculate persona progress using timer-based system
  const personaProgress = useMemo((): IPersonaProgressItem[] => {
    if (!profiles.length) return [];

    return profiles.map((profile, index) => {
      let itemStatus: 'pending' | 'processing' | 'completed' = 'pending';

      if (status === 'completed') {
        itemStatus = 'completed';
      } else if (status === 'running') {
        if (completedProfiles.has(index)) {
          itemStatus = 'completed';
        } else if (index === currentPulsingIndex) {
          itemStatus = 'processing';
        } else {
          itemStatus = 'pending';
        }
      }

      return {
        profile,
        status: itemStatus,
      };
    });
  }, [profiles, status, currentPulsingIndex, completedProfiles]);

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
      />

      {/* Interview Progress Card */}
      <InterviewProgressCard personaProgress={personaProgress} />
    </div>
  );
};

// Running Synthetic Test Card Component
const RunningTestCard: React.FC<{
  progress: number;
  message?: string;
  currentStage?: string;
  isInitializing?: boolean;
}> = ({ progress, message, currentStage, isInitializing = false }) => {
  // Smart progress normalization to handle 3-stage pipeline
  const [normalizedProgress, setNormalizedProgress] = useState(0);
  const [currentStageState, setCurrentStageState] = useState<string>('');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [lastStageProgress, setLastStageProgress] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    // Define the 3 main pipeline stages with their global progress ranges
    const stageRanges: Record<
      string,
      { min: number; max: number; label: string; stage: number }
    > = {
      // Stage 1: Synthetic Interview Generation (0-35%)
      initializing: {
        min: 0,
        max: 5,
        label: 'Initializing synthetic test...',
        stage: 1,
      },
      generating_personas: {
        min: 5,
        max: 30,
        label: 'Generating synthetic interviews...',
        stage: 1,
      },
      generating_original: {
        min: 5,
        max: 30,
        label: 'Generating synthetic interviews...',
        stage: 1,
      },
      generating_variation: {
        min: 5,
        max: 30,
        label: 'Generating synthetic interviews...',
        stage: 1,
      },
      storing_results: {
        min: 30,
        max: 35,
        label: 'Storing interview results...',
        stage: 1,
      },
      analysis_starting: {
        min: 35,
        max: 35,
        label: 'Starting analysis pipeline...',
        stage: 1,
      },

      // Stage 2: Individual File Analysis (35-75%)
      extracting_text: {
        min: 35,
        max: 55,
        label: 'Extracting content from interviews...',
        stage: 2,
      },
      analyzing_content: {
        min: 55,
        max: 70,
        label: 'Analyzing interview content...',
        stage: 2,
      },

      // Stage 3: Test-Level Findings (75-100%)
      generating_insights: {
        min: 75,
        max: 95,
        label: 'Generating insights and findings...',
        stage: 3,
      },
      finalizing: {
        min: 95,
        max: 100,
        label: 'Finalizing results...',
        stage: 3,
      },
    };

    // Determine current stage info
    const stageInfo =
      currentStage && stageRanges[currentStage]
        ? stageRanges[currentStage]
        : stageRanges['initializing'];

    let newProgress = progress;
    let shouldUpdate = true;
    let stageChangeMessage = '';

    // Handle stage transitions and progress normalization
    if (currentStage && stageRanges[currentStage]) {
      const { min, max, stage: stageNumber } = stageInfo;

      // Check if we're starting a new pipeline stage
      const previousStageNumber =
        currentStageState && stageRanges[currentStageState]
          ? stageRanges[currentStageState].stage
          : 0;

      if (stageNumber > previousStageNumber) {
        // New pipeline stage started - show transition message
        const stageNames: Record<number, string> = {
          1: 'Interview Generation',
          2: 'Content Analysis',
          3: 'Insights Generation',
        };

        if (previousStageNumber > 0) {
          stageChangeMessage = `${stageNames[previousStageNumber]} complete. Starting ${stageNames[stageNumber]}...`;
        }
      }

      // Normalize progress within the stage range
      const stageSpan = max - min;
      if (stageSpan > 0) {
        const stageProgress = Math.max(0, Math.min(100, progress)) / 100;
        newProgress = min + stageProgress * stageSpan;
      } else {
        newProgress = min; // For stages with no span (like analysis_starting)
      }

      // Prevent backwards progress within the same pipeline stage
      const lastProgressForStage = lastStageProgress[currentStage] || 0;
      if (
        newProgress < lastProgressForStage &&
        stageNumber === previousStageNumber
      ) {
        shouldUpdate = false; // Don't update if progress would go backwards in same stage
      } else {
        setLastStageProgress((prev) => ({
          ...prev,
          [currentStage]: newProgress,
        }));
      }
    }

    // Update progress (ensure it never goes backwards globally)
    if (shouldUpdate) {
      const progressDifference = newProgress - normalizedProgress;
      if (progressDifference >= -1) {
        // Allow tiny decreases for rounding
        setNormalizedProgress(
          Math.min(100, Math.max(normalizedProgress, newProgress)),
        );
      }
    }

    // Update stage information and messages
    if (currentStage !== currentStageState) {
      setCurrentStageState(currentStage || '');

      // Show stage change message briefly, then switch to regular message
      if (stageChangeMessage) {
        setStageMessage(stageChangeMessage);
        // Switch to regular message after 3 seconds
        setTimeout(() => {
          setStageMessage(message || stageInfo.label);
        }, 3000);
      } else {
        setStageMessage(message || stageInfo.label);
      }
    } else if (message && message !== stageMessage && !stageChangeMessage) {
      setStageMessage(message);
    }
  }, [
    progress,
    currentStage,
    message,
    lastStageProgress,
    normalizedProgress,
    currentStageState,
    stageMessage,
  ]);
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border shadow-sm'>
      {/* Left border accent */}
      <div className='border-l-4 border-l-amber-600'>
        <div className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h2 className='aucctus-text-primary mb-1 text-2xl font-bold'>
                Running Synthetic Test
              </h2>
              <p className='aucctus-text-secondary aucctus-text-sm'>
                {stageMessage || 'Synthetic 1-1 Customer Interviews'}
              </p>
            </div>
            <div className='text-right'>
              <div className='aucctus-text-primary text-3xl font-bold'>
                {isInitializing ? '...' : `${Math.round(normalizedProgress)}%`}
              </div>
              <div className='aucctus-text-secondary aucctus-text-xs'>
                {isInitializing ? 'Reconnecting' : 'Complete'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='aucctus-bg-secondary-subtle h-3 overflow-hidden rounded-full'>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-out',
                isInitializing ? 'animate-pulse bg-gray-400' : 'bg-amber-600',
              )}
              style={{
                width: isInitializing
                  ? '100%'
                  : `${Math.max(0, Math.min(100, normalizedProgress))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Interview Progress Card Component
const InterviewProgressCard: React.FC<{
  personaProgress: IPersonaProgressItem[];
}> = ({ personaProgress }) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
      <div className='p-6'>
        <h3 className='aucctus-text-primary mb-6 text-center text-xl font-semibold'>
          Interview Progress
        </h3>

        <div className='flex items-center justify-center gap-8'>
          {personaProgress.map((item, index) => (
            <PersonaIndicator
              key={item.profile.uuid}
              profile={item.profile}
              status={item.status}
              isLast={index === personaProgress.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Persona Indicator Component
const PersonaIndicator: React.FC<{
  profile: ICustomerProfile;
  status: 'pending' | 'processing' | 'completed';
  isLast: boolean;
}> = ({ profile, status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'processing':
        return {
          border: 'border-4 border-amber-600',
          avatar: 'opacity-100',
          animation: 'animate-pulse',
        };
      case 'completed':
        return {
          border: 'border-4 border-green-500',
          avatar: 'opacity-100',
          animation: '',
        };
      default: // pending
        return {
          border: 'border-2 aucctus-border-secondary',
          avatar: 'opacity-60',
          animation: '',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className='flex flex-col items-center gap-3'>
      {/* Avatar with status border */}
      <div className='relative'>
        <div
          className={cn(
            'overflow-hidden rounded-full transition-all duration-300',
            styles.border,
            styles.animation,
          )}
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className={cn(
                'h-16 w-16 object-cover transition-opacity duration-300',
                styles.avatar,
              )}
            />
          ) : (
            <div
              className={cn(
                'aucctus-bg-secondary flex h-16 w-16 items-center justify-center transition-opacity duration-300',
                styles.avatar,
              )}
            >
              <Icon
                variant='user-square'
                className='aucctus-stroke-secondary h-8 w-8'
              />
            </div>
          )}
        </div>

        {/* Status indicator */}
        {status === 'completed' && (
          <div className='absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1'>
            <Icon variant='check' className='h-3 w-3 stroke-white stroke-2' />
          </div>
        )}
      </div>

      {/* Persona Label */}
      <div className='text-center'>
        <div className='aucctus-text-primary aucctus-text-sm font-medium'>
          {profile.segment}
        </div>
        <div className='aucctus-text-secondary aucctus-text-xs'>
          {profile.name}
        </div>
      </div>
    </div>
  );
};

// Completed State Component
const CompletedState: React.FC<{
  profiles: ICustomerProfile[];
  resultsCount?: number;
  onViewResults?: () => void;
}> = ({ profiles, resultsCount, onViewResults }) => {
  return (
    <div className='space-y-6'>
      {/* Success Card */}
      <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border shadow-sm'>
        <div className='border-l-4 border-l-green-500'>
          <div className='p-8 text-center'>
            <h2 className='aucctus-text-primary mb-2 text-3xl font-bold'>
              Synthetic Test Complete!
            </h2>
            <p className='aucctus-text-secondary aucctus-text-lg mb-6'>
              Successfully interviewed {profiles.length} synthetic participants
            </p>

            <button
              className='btn btn-primary btn-lg inline-flex items-center gap-2'
              onClick={onViewResults}
            >
              <Icon
                variant='file-attachment'
                className='aucctus-stroke-white h-5 w-5'
              />
              View Results
            </button>
          </div>
        </div>
      </div>

      {/* Completed Interviews Grid */}
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border shadow-sm'>
        <div className='p-6'>
          <h3 className='aucctus-text-primary mb-6 text-xl font-semibold'>
            Completed Interviews
          </h3>

          <div className='grid grid-cols-2 gap-4'>
            {profiles.map((profile, index) => {
              // For synthetic interviews, we typically run 1 interview per profile
              // If resultsCount is available, distribute evenly across profiles
              // Otherwise, assume 1 interview per profile (standard synthetic test)
              const totalResults = resultsCount || profiles.length;
              const interviewsPerProfile =
                profiles.length > 0
                  ? Math.floor(totalResults / profiles.length)
                  : 0;
              const remainderInterviews =
                profiles.length > 0 ? totalResults % profiles.length : 0;
              // Distribute remainder interviews to first profiles
              const profileInterviews =
                interviewsPerProfile + (index < remainderInterviews ? 1 : 0);

              return (
                <CompletedInterviewItem
                  key={profile.uuid}
                  profile={profile}
                  completedCount={profileInterviews}
                />
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className='mt-8 grid grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='aucctus-text-primary text-4xl font-bold'>
                {profiles.length}
              </div>
              <div className='aucctus-text-secondary aucctus-text-sm'>
                Participants
              </div>
            </div>
            <div className='text-center'>
              <div className='aucctus-text-primary text-4xl font-bold'>
                {resultsCount || profiles.length}
              </div>
              <div className='aucctus-text-secondary aucctus-text-sm'>
                Responses
              </div>
            </div>
            <div className='text-center'>
              <div className='aucctus-text-primary text-4xl font-bold'>
                100%
              </div>
              <div className='aucctus-text-secondary aucctus-text-sm'>
                Complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Completed Interview Item Component
const CompletedInterviewItem: React.FC<{
  profile: ICustomerProfile;
  completedCount: number;
}> = ({ profile, completedCount }) => {
  return (
    <div className='aucctus-bg-secondary-subtle rounded-lg p-4'>
      <div className='flex items-center gap-3'>
        {/* Avatar with checkmark */}
        <div className='relative'>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className='h-12 w-12 rounded-full object-cover'
            />
          ) : (
            <div className='aucctus-bg-secondary flex h-12 w-12 items-center justify-center rounded-full'>
              <Icon
                variant='user-square'
                className='aucctus-stroke-secondary h-6 w-6'
              />
            </div>
          )}

          <div className='absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1'>
            <Icon variant='check' className='h-3 w-3 stroke-white stroke-2' />
          </div>
        </div>

        {/* Profile Info */}
        <div className='flex-1'>
          <div className='aucctus-text-primary aucctus-text-md font-semibold'>
            {profile.segment}
          </div>
          <div className='aucctus-text-secondary aucctus-text-sm'>
            {profile.name}
          </div>
        </div>

        {/* Completed Count */}
        <div className='text-right'>
          <div className='aucctus-text-primary text-2xl font-bold text-green-600'>
            {completedCount}
          </div>
          <div className='aucctus-text-secondary aucctus-text-xs'>
            completed
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SyntheticLoadingUI);

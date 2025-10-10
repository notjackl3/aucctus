import { cn } from '@libs/utils/react';
import React, { useEffect, useRef, useState } from 'react';

interface RunningTestCardProps {
  progress: number;
  message?: string;
  currentStage?: string;
  isInitializing?: boolean;
}

export const RunningTestCard: React.FC<RunningTestCardProps> = ({
  progress,
  message,
  currentStage,
  isInitializing = false,
}) => {
  // Smart progress normalization to handle 3-stage pipeline
  const [normalizedProgress, setNormalizedProgress] = useState(0);
  const [currentStageState, setCurrentStageState] = useState<string>('');
  const [stageMessage, setStageMessage] = useState<string>('');
  // Use ref instead of state - only needed for comparison, not rendering
  const lastStageProgressRef = useRef<Record<string, number>>({});

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
      const lastProgressForStage =
        lastStageProgressRef.current[currentStage] || 0;
      if (
        newProgress < lastProgressForStage &&
        stageNumber === previousStageNumber
      ) {
        shouldUpdate = false; // Don't update if progress would go backwards in same stage
      } else {
        // Update ref directly - no re-render needed
        lastStageProgressRef.current[currentStage] = newProgress;
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

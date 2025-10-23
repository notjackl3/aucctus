import AgentProgressBar from '@components/Progress/AgentProgressBar';
import { useSyntheticPipelineEstimate } from '@hooks/query/agent-timing.hook';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface RunningTestCardProps {
  progress: number;
  message?: string;
  currentStage?: string;
  isInitializing?: boolean;
  conceptUuid?: string;
  numProfiles: number;
  estimatedSeconds?: number | null;
  startTime?: number;
}

export const RunningTestCard: React.FC<RunningTestCardProps> = ({
  progress,
  message,
  currentStage,
  isInitializing = false,
  conceptUuid,
  numProfiles,
  estimatedSeconds: propEstimatedSeconds,
  startTime,
}) => {
  const [stageMessage, setStageMessage] = useState<string>('');
  const prevStageRef = useRef('');

  // Fetch specialized pipeline timing estimate
  const { data: pipelineEstimate } = useSyntheticPipelineEstimate(
    conceptUuid || '',
    numProfiles,
    {
      enabled: !!conceptUuid && numProfiles > 0 && !isInitializing,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  // Calculate estimated seconds with fallback
  // Backend returns avg of last 10 total execution times (profile-count agnostic)
  const estimatedSeconds = useMemo(() => {
    if (propEstimatedSeconds !== undefined && propEstimatedSeconds !== null) {
      return propEstimatedSeconds;
    }
    if (pipelineEstimate?.estimatedSeconds) {
      // Use backend estimate (already accounts for parallelization)
      return Math.round(pipelineEstimate.estimatedSeconds);
    }
    // Fallback: Observed time is ~290-300s regardless of profile count
    // because interviews run in parallel
    return 300; // 5 minutes flat estimate
  }, [pipelineEstimate, propEstimatedSeconds]);

  // Stage label mapping for user-friendly messages
  const stageLabels: Record<string, string> = useMemo(
    () => ({
      initializing: 'Initializing synthetic test...',
      generating_personas: 'Generating synthetic interviews...',
      generating_original: 'Generating synthetic interviews...',
      generating_variation: 'Generating synthetic interviews...',
      storing_results: 'Storing interview results...',
      analysis_starting: 'Starting analysis pipeline...',
      extracting_text: 'Extracting content from interviews...',
      analyzing_content: 'Analyzing interview content...',
      processing_files: 'Processing interview files...',
      extracting_findings: 'Extracting findings...',
      generating_findings: 'Generating findings...',
      generating_insights: 'Generating insights and findings...',
      finalizing: 'Finalizing results...',
      finalizing_results: 'Finalizing results...',
    }),
    [],
  );

  // Update stage message when stage changes
  useEffect(() => {
    if (currentStage !== prevStageRef.current) {
      const newMessage =
        message || stageLabels[currentStage || ''] || 'Processing...';
      setStageMessage(newMessage);
      prevStageRef.current = currentStage || '';
    } else if (message) {
      // Update message even if stage hasn't changed
      setStageMessage(message);
    }
  }, [currentStage, message, stageLabels]);

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border shadow-sm'>
      {/* Left border accent */}
      <div className='border-l-4 border-l-amber-600'>
        <div className='p-6'>
          <h2 className='aucctus-text-primary mb-4 text-2xl font-bold'>
            Running Synthetic Test
          </h2>

          {/* AgentProgressBar - handles timing and progress display */}
          <AgentProgressBar
            agentName='SyntheticPipeline'
            conceptUuid={conceptUuid}
            progress={progress >= 95 ? progress : undefined}
            overrideEstimatedSeconds={estimatedSeconds}
            message={stageMessage || 'Synthetic 1-1 Customer Interviews'}
            showPercentage={false}
            showTimeRemaining={true}
            theme='warning'
            size='lg'
            isLoading={isInitializing}
            startTime={startTime}
          />
        </div>
      </div>
    </div>
  );
};

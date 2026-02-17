import { useConceptVideoGenerate } from '@hooks/query/concepts.hook';
import { useConceptVideoGenerationEvents } from '@hooks/sockets/conceptVideo';
import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Clock, Download, PlaySquare } from 'lucide-react';

interface IConceptVideoGenerationProps {
  conceptUuid: string;
  existingVideoUrl?: string;
  videoStatus?: 'generating' | 'complete' | 'error';
  videoGenerationStage?: string;
  videoGenerationProgress?: number;
  onVideoGenerated?: (videoUrl: string) => void;
}

const ConceptVideoGeneration: React.FC<IConceptVideoGenerationProps> = ({
  conceptUuid,
  existingVideoUrl,
  videoStatus,
  videoGenerationStage,
  videoGenerationProgress,
  onVideoGenerated,
}) => {
  // Pass persisted state to socket hook for page refresh scenarios
  const { videoGenerationState, resetState } = useConceptVideoGenerationEvents(
    conceptUuid,
    onVideoGenerated,
    {
      status: videoStatus,
      progress: videoGenerationProgress,
      stage: videoGenerationStage,
      videoUrl: existingVideoUrl,
    },
  );
  const generateVideoMutation = useConceptVideoGenerate(conceptUuid);

  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(
    existingVideoUrl,
  );

  // Update video URL when generation completes
  useEffect(() => {
    if (
      videoGenerationState.status === 'completed' &&
      videoGenerationState.videoUrl
    ) {
      setCurrentVideoUrl(videoGenerationState.videoUrl);
    }
  }, [videoGenerationState.status, videoGenerationState.videoUrl]);

  // Update video URL if existingVideoUrl changes
  useEffect(() => {
    if (existingVideoUrl && videoGenerationState.status === 'idle') {
      setCurrentVideoUrl(existingVideoUrl);
    }
  }, [existingVideoUrl, videoGenerationState.status]);

  const handleGenerateVideo = useCallback(() => {
    generateVideoMutation.mutate();
  }, [generateVideoMutation]);

  const handleResetAndRegenerate = useCallback(() => {
    resetState();
    setCurrentVideoUrl(undefined);
    generateVideoMutation.mutate();
  }, [resetState, generateVideoMutation]);

  const isGenerating = videoGenerationState.status === 'running';
  const hasError = videoGenerationState.status === 'error';
  const hasCompleted = videoGenerationState.status === 'completed';
  const hasVideo = currentVideoUrl !== undefined;

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='aucctus-text-primary aucctus-header-md'>
            🎬 Concept Video Generation
          </h3>
          <p className='aucctus-text-secondary aucctus-text-sm'>
            Generate an AI-powered video visualization of your concept
          </p>
        </div>

        {!isGenerating && (
          <button
            className='btn btn-primary btn-sm'
            onClick={hasVideo ? handleResetAndRegenerate : handleGenerateVideo}
            disabled={generateVideoMutation.isLoading}
          >
            <PlaySquare className='aucctus-stroke-white h-4 w-4' />
            {hasVideo ? 'Regenerate Video' : 'Generate Video'}
          </button>
        )}
      </div>

      {/* Progress Card - shown during generation */}
      {isGenerating && (
        <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border shadow-sm'>
          <div className='aucctus-border-brand border-l-4'>
            <div className='p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <div>
                  <h4 className='aucctus-text-primary mb-1 text-lg font-bold'>
                    Generating Video
                  </h4>
                  <p className='aucctus-text-secondary aucctus-text-sm'>
                    {videoGenerationState.message ||
                      'Processing video generation...'}
                  </p>
                </div>
                <div className='text-right'>
                  <div className='aucctus-text-primary text-2xl font-bold'>
                    {Math.round(videoGenerationState.progress)}%
                  </div>
                  <div className='aucctus-text-secondary aucctus-text-xs'>
                    Complete
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='aucctus-bg-secondary-subtle h-3 overflow-hidden rounded-full'>
                <div
                  className='aucctus-bg-brand-solid h-full rounded-full transition-all duration-1000 ease-out'
                  style={{
                    width: `${Math.max(0, Math.min(100, videoGenerationState.progress))}%`,
                  }}
                />
              </div>

              {/* Stage indicator */}
              {videoGenerationState.stage && (
                <div className='aucctus-text-tertiary mt-2 flex items-center gap-2 text-xs'>
                  <Clock className='aucctus-stroke-tertiary h-3 w-3' />
                  <span>Stage: {videoGenerationState.stage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className='aucctus-bg-error-subtle aucctus-border-error rounded-xl border p-6'>
          <div className='flex items-start gap-3'>
            <AlertCircle className='aucctus-stroke-error-primary h-5 w-5 flex-shrink-0' />
            <div className='flex-1'>
              <h4 className='aucctus-text-error-primary mb-1 font-semibold'>
                Video Generation Failed
              </h4>
              <p className='aucctus-text-secondary aucctus-text-sm'>
                {videoGenerationState.error ||
                  'An error occurred during video generation'}
              </p>
            </div>
            <button
              className='btn btn-secondary btn-sm'
              onClick={handleResetAndRegenerate}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Success State with Video Player */}
      {hasVideo && !isGenerating && (
        <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border shadow-lg'>
          <div className='relative aspect-video w-full'>
            <video
              src={currentVideoUrl}
              className='h-full w-full object-cover'
              autoPlay
              muted
              loop
              playsInline
              controls
            >
              <track kind='captions' />
              Your browser does not support the video tag.
            </video>

            {hasCompleted && (
              <div className='absolute right-4 top-4'>
                <div className='aucctus-bg-success-solid flex items-center gap-2 rounded-full px-3 py-1.5 shadow-lg'>
                  <Check className='h-4 w-4 stroke-white' />
                  <span className='aucctus-text-xs font-medium text-white'>
                    Generated
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className='aucctus-bg-secondary-subtle aucctus-border-secondary border-t p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='aucctus-text-primary aucctus-text-sm font-medium'>
                  Concept Visualization Video
                </p>
                <p className='aucctus-text-tertiary aucctus-text-xs'>
                  AI-generated using Gemini Veo
                </p>
              </div>
              <a
                href={currentVideoUrl}
                download='concept-video.mp4'
                className='btn btn-secondary btn-xs'
              >
                <Download className='aucctus-stroke-secondary h-3 w-3' />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - no video yet */}
      {!hasVideo && !isGenerating && !hasError && (
        <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-xl border p-6 text-center'>
          <PlaySquare className='aucctus-stroke-tertiary mx-auto mb-4 h-16 w-16' />
          <h4 className='aucctus-text-primary mb-2 text-lg font-semibold'>
            No Video Yet
          </h4>
          <p className='aucctus-text-secondary aucctus-text-sm'>
            Generate an AI-powered video visualization of your concept using
            Gemini Veo
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(ConceptVideoGeneration);

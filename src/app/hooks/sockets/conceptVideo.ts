import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useSocketEvent } from './aucctus';
import { toast } from '@components';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  IConceptVideoGenerationStartedMessage,
  IConceptVideoGenerationProgressMessage,
  IConceptVideoGenerationCompletedMessage,
  IConceptVideoGenerationErrorMessage,
} from '@libs/api/types';

interface IConceptVideoGenerationState {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  message: string;
  stage?: string;
  error?: string;
  videoUrl?: string;
}

interface IInitialVideoState {
  status?: 'generating' | 'complete' | 'error';
  progress?: number;
  stage?: string;
  videoUrl?: string;
}

export const useConceptVideoGenerationEvents = (
  conceptUuid: string,
  onComplete?: (videoUrl: string) => void,
  initialState?: IInitialVideoState,
) => {
  const queryClient = useQueryClient();

  // Initialize state from persisted backend data if available
  const getInitialState = (): IConceptVideoGenerationState => {
    if (initialState?.status === 'generating') {
      return {
        status: 'running',
        progress: initialState.progress || 0,
        message: 'Resuming video generation...',
        stage: initialState.stage,
      };
    }
    return {
      status: 'idle',
      progress: 0,
      message: '',
    };
  };

  const [videoGenerationState, setVideoGenerationState] =
    useState<IConceptVideoGenerationState>(getInitialState);

  // Sync state with prop changes when conceptOverview refetches
  // This ensures we always display the latest persisted state from the backend
  useEffect(() => {
    // Only update if we have persisted state from backend
    if (initialState?.status === 'generating') {
      setVideoGenerationState((currentState) => {
        // Don't override if we're already at a higher progress from WebSocket
        if (
          currentState.status === 'running' &&
          currentState.progress > (initialState.progress || 0)
        ) {
          return currentState;
        }

        // Update to latest backend state
        return {
          status: 'running',
          progress: initialState.progress || 0,
          message: currentState.message || 'Resuming video generation...',
          stage: initialState.stage || currentState.stage,
        };
      });
    } else if (initialState?.status === 'error') {
      // Sync error state from backend
      setVideoGenerationState({
        status: 'error',
        progress: 0,
        message: 'Video generation failed',
        error: 'Video generation encountered an error',
      });
    }
    // Note: We don't sync 'complete' status here because WebSocket handles that
    // and we want the videoUrl from the WebSocket message
  }, [initialState?.status, initialState?.progress, initialState?.stage]);

  // Started event
  useSocketEvent<
    'concept.video.generation.started.user',
    IConceptVideoGenerationStartedMessage
  >(
    'concept.video.generation.started.user',
    useCallback(
      (data: IConceptVideoGenerationStartedMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        setVideoGenerationState({
          status: 'running',
          progress: 0,
          message: data.message,
        });
      },
      [conceptUuid],
    ),
  );

  // Progress updates
  useSocketEvent<
    'concept.video.generation.progress.user',
    IConceptVideoGenerationProgressMessage
  >(
    'concept.video.generation.progress.user',
    useCallback(
      (data: IConceptVideoGenerationProgressMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        setVideoGenerationState((prev) => ({
          ...prev,
          status: 'running',
          progress: data.progress,
          message: data.message,
          stage: data.stage,
        }));
      },
      [conceptUuid],
    ),
  );

  // Completion
  useSocketEvent<
    'concept.video.generation.completed.user',
    IConceptVideoGenerationCompletedMessage
  >(
    'concept.video.generation.completed.user',
    useCallback(
      (data: IConceptVideoGenerationCompletedMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        setVideoGenerationState({
          status: 'completed',
          progress: 100,
          message: data.message,
          videoUrl: data.videoUrl,
        });

        // Invalidate concept overview query to refresh video URL
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptOverview, conceptUuid],
        });

        onComplete?.(data.videoUrl);
        toast.completed(
          'Video Generated',
          'Your concept video has been created successfully',
        );
      },
      [conceptUuid, queryClient, onComplete],
    ),
  );

  // Error handling
  useSocketEvent<
    'concept.video.generation.error.user',
    IConceptVideoGenerationErrorMessage
  >(
    'concept.video.generation.error.user',
    useCallback(
      (data: IConceptVideoGenerationErrorMessage) => {
        if (data.conceptUuid !== conceptUuid) return;

        setVideoGenerationState({
          status: 'error',
          progress: 0,
          message: data.errorMessage,
          error: data.errorMessage,
        });

        toast.errorAnimated(
          'Video Generation Failed',
          data.errorMessage || 'An error occurred while generating the video',
        );
      },
      [conceptUuid],
    ),
  );

  const resetState = useCallback(() => {
    setVideoGenerationState({
      status: 'idle',
      progress: 0,
      message: '',
    });
  }, []);

  return { videoGenerationState, resetState };
};

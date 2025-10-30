import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { toast } from '@components';
import { ConceptShareFormat } from '@libs/api/types';
import api from '@libs/api';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import {
  useConceptMagicShareLatest,
  useConceptMagicShareEmail,
} from '@hooks/query/concepts.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';

type ShareFormat = ConceptShareFormat;

interface PresetOption {
  id: string;
  title: string;
  format: ShareFormat;
  description: string;
}

interface UseMagicShareModalProps {
  conceptUuid: string;
  onClose: () => void;
}

export const useMagicShareModal = ({
  conceptUuid,
  onClose,
}: UseMagicShareModalProps) => {
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<ShareFormat>('pdf');
  const [isTyping, setIsTyping] = useState(false);
  const [carouselScrollLeft, setCarouselScrollLeft] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [isSubmittingGenerate, setIsSubmittingGenerate] = useState(false);

  const queryClient = useQueryClient();
  const setShareProgress = useStore.getState().magicShare.setShareProgress;
  const setShareError = useStore.getState().magicShare.setShareError;
  const setShouldEmail = useStore.getState().magicShare.setShouldEmail;
  const clearShareProgress = useStore(
    (state) => state.magicShare.clearShareProgress,
  );
  const account = useStore((state) => state.auth.account);

  // Fetch the latest magic share data from the API
  const { magicShareLatest, isLoading: isLoadingLatest } =
    useConceptMagicShareLatest(conceptUuid);

  // Email mutation hook
  const { mutate: sendEmail, isLoading: isSendingEmail } =
    useConceptMagicShareEmail();

  // Get data from Zustand store
  const shareProgress = useStore((state) =>
    state.magicShare.getShareProgress(conceptUuid),
  );

  // On mount: Always fetch fresh data from /latest endpoint
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.conceptMagicShareLatest, conceptUuid],
    });
  }, [conceptUuid, queryClient]);

  // Sync latest magic share data with Zustand store if available
  useEffect(() => {
    // If magicShareLatest is undefined (404), clear the store
    if (!magicShareLatest) {
      clearShareProgress(conceptUuid);
      return;
    }

    // Check if we have recent WebSocket data (within last 5 seconds)
    const hasRecentWebSocketData =
      shareProgress && Date.now() - shareProgress.timestamp < 5000;

    // Only sync API data to store if we don't have recent WebSocket updates
    // This prevents API data from overwriting fresh WebSocket updates
    if (hasRecentWebSocketData) return;

    // Note: setShareProgress automatically preserves the shouldEmail flag
    if (
      magicShareLatest.status === 'completed' &&
      !magicShareLatest.lastAccessedAt
    ) {
      setShareProgress(
        conceptUuid,
        magicShareLatest.stage || 'completed',
        magicShareLatest.message || 'Generation complete!',
        magicShareLatest.progress ?? 100,
        magicShareLatest.fileUrl,
        magicShareLatest.uuid,
      );
    } else if (
      magicShareLatest.status === 'generating' &&
      !magicShareLatest.lastAccessedAt
    ) {
      // Use API progress fields if available, otherwise fall back to defaults
      const stage =
        magicShareLatest.stage ||
        (magicShareLatest.fileType === 'pdf'
          ? 'generating_pdf'
          : magicShareLatest.fileType === 'video'
            ? 'generating_video'
            : 'generating_html');

      setShareProgress(
        conceptUuid,
        stage,
        magicShareLatest.message || 'Generating...',
        magicShareLatest.progress ?? 50,
        undefined,
        magicShareLatest.uuid,
      );
    } else if (magicShareLatest.status === 'failed') {
      const errorMessage =
        magicShareLatest.message ||
        magicShareLatest.errorDetails ||
        'Failed to generate document. Please try again.';

      setShareError(
        conceptUuid,
        errorMessage,
        magicShareLatest.errorCode,
        magicShareLatest.errorDetails,
      );

      if (!magicShareLatest.lastAccessedAt) {
        toast.error('Magic Share Failed', errorMessage, 5000);
      }
    }
  }, [
    magicShareLatest,
    conceptUuid,
    setShareProgress,
    setShareError,
    shareProgress,
    clearShareProgress,
  ]);

  // Derive state from Zustand store or API data
  // Prefer WebSocket data for real-time updates, fall back to API data
  const progress = shareProgress?.progress ?? magicShareLatest?.progress ?? 0;
  const hasError =
    magicShareLatest?.status === 'failed' || shareProgress?.stage === 'error';
  const errorMessage =
    shareProgress?.error?.message ||
    magicShareLatest?.errorDetails ||
    magicShareLatest?.message ||
    'Something went wrong. Please try generating again.';
  const isComplete =
    progress >= 100 ||
    (shareProgress?.stage === 'completed' && !!shareProgress.snapshotUrl) ||
    (magicShareLatest?.status === 'completed' &&
      !magicShareLatest.lastAccessedAt);
  const isGenerating =
    !hasError &&
    ((shareProgress !== undefined &&
      !isComplete &&
      shareProgress.stage !== undefined) ||
      magicShareLatest?.status === 'generating');

  // Map progress stages to user-friendly messages
  const progressMessage = useMemo(() => {
    // Stage messages mapping
    const stageMessages: Record<string, string> = {
      started: 'Starting generation...',
      gathering_data: 'Gathering concept data...',
      generating_html: 'Generating HTML...',
      generating_pdf: 'Generating PDF...',
      generating_video: 'Generating video...',
      generating_slides: 'Generating slides...',
      uploading: 'Uploading document...',
      completed: 'Generation complete!',
    };

    // Prefer WebSocket message, fall back to API message
    const currentStage = shareProgress?.stage || magicShareLatest?.stage;
    const currentMessage = shareProgress?.message || magicShareLatest?.message;

    if (currentStage) {
      return stageMessages[currentStage] || currentMessage || 'Processing...';
    }

    return currentMessage || 'Processing...';
  }, [shareProgress, magicShareLatest]);

  // Get the actual format type (for icons, etc.)
  const actualFormat = useMemo(() => {
    // Use the actual fileType from the API response if available, otherwise fall back to local format state
    return magicShareLatest?.fileType || format;
  }, [format, magicShareLatest?.fileType]);

  // Generate title based on format
  const generatedTitle = useMemo(() => {
    const FORMAT_OPTIONS: Array<{
      value: ShareFormat;
      label: string;
    }> = [
      { value: 'pdf', label: 'PDF' },
      { value: 'ppt', label: 'PowerPoint' },
      { value: 'video', label: 'Video' },
    ];

    const formatOption = FORMAT_OPTIONS.find((o) => o.value === actualFormat);
    return formatOption?.label || 'Document';
  }, [actualFormat]);

  const handlePresetClick = useCallback((preset: PresetOption) => {
    setDescription('');
    setFormat(preset.format);
    setIsTyping(true);

    const textToType = preset.description;
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < textToType.length) {
        setDescription(textToType.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 3);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!conceptUuid) {
      toast.error('Concept UUID is required');
      return;
    }

    setIsSubmittingGenerate(true);
    try {
      await api.concept.generateMagicShare(conceptUuid, {
        editInstructions: description.trim(),
        type: format,
      });

      const magicShareUuid = account?.uuid
        ? `${account.uuid}:${conceptUuid}`
        : undefined;

      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptMagicShareLatest, conceptUuid],
      });

      setShareProgress(
        conceptUuid,
        'started',
        'Started',
        0,
        undefined,
        magicShareUuid,
      );

      toast.success(
        'Magic Share requested!',
        'Your document will be generated shortly.',
        4000,
      );
    } catch (error) {
      toast.error('Failed to generate document. Please try again.');
      clearShareProgress(conceptUuid);
      setShareError(
        conceptUuid,
        'Failed to generate document. Please try again.',
      );
    } finally {
      setIsSubmittingGenerate(false);
    }
  }, [
    conceptUuid,
    description,
    format,
    clearShareProgress,
    queryClient,
    setShareProgress,
    setShareError,
    account?.uuid,
  ]);

  const clearMagicShare = useCallback(async () => {
    setIsClearing(true);
    try {
      // Clear local state immediately to reset UI
      clearShareProgress(conceptUuid);
      setDescription('');

      // Clear backend cache
      await api.concept.clearConceptMagicShare(conceptUuid);

      // Remove the cached query data to force a fresh fetch
      queryClient.removeQueries({
        queryKey: [AucctusQueryKeys.conceptMagicShareLatest, conceptUuid],
      });

      // Refetch to get the cleared state (should return 404 or empty)
      await queryClient.refetchQueries({
        queryKey: [AucctusQueryKeys.conceptMagicShareLatest, conceptUuid],
      });
    } catch (error) {
      telemetry.error('Failed to clear magic share cache:', error);
      throw error;
    } finally {
      setIsClearing(false);
    }
  }, [conceptUuid, clearShareProgress, queryClient]);

  const handleCancel = useCallback(async () => {
    try {
      await clearMagicShare();
    } catch (error) {
      toast.error('Failed to cancel magic share', 'Please try again.');
    }
  }, [clearMagicShare]);

  const handleRestart = useCallback(async () => {
    try {
      await clearMagicShare();
    } catch (error) {
      toast.error('Failed to reset magic share', 'Please try again.');
    }
  }, [clearMagicShare]);

  const handleDownload = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.conceptMagicShareLatest, conceptUuid],
    });

    const downloadUrl = magicShareLatest?.fileUrl || shareProgress?.snapshotUrl;

    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      clearShareProgress(conceptUuid);
      setDescription('');
    } else {
      toast.error('No file available', 'Please try generating again.');
    }

    onClose();
  }, [
    magicShareLatest,
    shareProgress,
    onClose,
    clearShareProgress,
    conceptUuid,
    queryClient,
  ]);

  const handleEmail = useCallback(() => {
    const magicShareUuid =
      shareProgress?.magicShareUuid || magicShareLatest?.uuid;

    if (!magicShareUuid) {
      toast.error('No file available', 'Please try generating again.');
      return;
    }

    // Check if we've already requested email - prevent duplicate requests
    if (shareProgress?.shouldEmail) {
      toast.info(
        'Email already requested',
        'You will receive an email when generation completes.',
        { autoClose: 3000 },
      );
      return;
    }

    sendEmail(
      {
        conceptUuid,
        magicShareUuid,
      },
      {
        onSuccess: () => {
          // Mark that we've requested email in the store
          setShouldEmail(conceptUuid, true);

          if (isComplete) {
            // Generation already complete - email sent immediately
            toast.success(
              'Email sent successfully',
              'Your Magic Share has been sent!',
            );
            clearShareProgress(conceptUuid);
            setDescription('');
            onClose();
          } else {
            // Generation in progress - email will be sent when complete
            toast.success(
              'Email scheduled',
              'You will receive an email when generation completes.',
              4000,
            );
          }
        },
        onError: () => {
          toast.error('Failed to send email. Please try again.');
        },
      },
    );
  }, [
    conceptUuid,
    magicShareLatest,
    shareProgress,
    isComplete,
    sendEmail,
    setShouldEmail,
    clearShareProgress,
    onClose,
  ]);

  const handleScroll = useCallback((scrollLeft: number) => {
    setCarouselScrollLeft(scrollLeft);
  }, []);

  const canScrollLeft = useMemo(
    () => carouselScrollLeft > 0,
    [carouselScrollLeft],
  );

  const canScrollRight = useCallback(
    (scrollWidth: number, clientWidth: number) => {
      return carouselScrollLeft < scrollWidth - clientWidth;
    },
    [carouselScrollLeft],
  );

  // Combined loading state for the modal
  const isLoading = isLoadingLatest || isClearing;

  // Check if email has already been requested
  const shouldEmail = shareProgress?.shouldEmail ?? false;

  // Check if we have the magicShareUuid needed for email
  const hasMagicShareUuid = !!(
    shareProgress?.magicShareUuid || magicShareLatest?.uuid
  );

  return {
    // State
    description,
    setDescription,
    format,
    setFormat,
    isTyping,
    carouselScrollLeft,
    isSendingEmail,
    isLoading,
    shouldEmail,
    hasMagicShareUuid,
    isSubmittingGenerate,

    // Derived state
    progress,
    hasError,
    errorMessage,
    isComplete,
    isGenerating,
    progressMessage,
    generatedTitle,
    actualFormat,

    // Handlers
    handlePresetClick,
    handleGenerate,
    handleCancel,
    handleRestart,
    handleDownload,
    handleEmail,
    handleScroll,
    canScrollLeft,
    canScrollRight,
  };
};

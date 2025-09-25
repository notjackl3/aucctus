import { useState, useEffect } from 'react';
import { ViewModeState, ConfirmationDialogState } from '../TestResults.types';
import { ITestResultProcessingState } from '../TestResultProcessingStatus';

interface UseTestResultsStateProps {
  conceptUuid?: string;
  testUuid?: string;
}

export const useTestResultsState = ({
  conceptUuid,
  testUuid,
}: UseTestResultsStateProps) => {
  // State for synthetic interview view mode (per result)
  const [viewModes, setViewModes] = useState<ViewModeState>({});

  // Local confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialogState | null>(null);

  // State to trigger dropzone reset
  const [dropzoneKey, setDropzoneKey] = useState(0);

  // State for bulk delete operation
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // State for download operation
  const [isDownloading, setIsDownloading] = useState(false);

  // Test result processing state
  const [processingState, setProcessingState] =
    useState<ITestResultProcessingState>({
      isProcessing: false,
      stage: null,
      message: '',
      progress: 0,
      error: null,
      testResultUuid: undefined,
      conceptUuid: undefined,
      testUuid: undefined,
      summary: undefined,
      learnings: [],
      keywords: [],
    });

  // Function to toggle view mode for a specific result
  const toggleViewMode = (resultUuid: string) => {
    setViewModes((prev) => ({
      ...prev,
      [resultUuid]: prev[resultUuid] === 'raw' ? 'structured' : 'raw',
    }));
  };

  // Clear stale processing state when component mounts or test changes
  useEffect(() => {
    setProcessingState({
      isProcessing: false,
      stage: null,
      message: '',
      progress: 0,
      error: null,
      testResultUuid: undefined,
      conceptUuid: undefined,
      testUuid: undefined,
      summary: undefined,
      learnings: [],
      keywords: [],
    });
  }, [conceptUuid, testUuid]);

  // Reset dropzone by updating key
  const resetDropzone = () => {
    setDropzoneKey((prev) => prev + 1);
  };

  return {
    // State
    viewModes,
    confirmationDialog,
    dropzoneKey,
    isDeletingAll,
    isDownloading,
    processingState,

    // Actions
    toggleViewMode,
    setConfirmationDialog,
    setIsDeletingAll,
    setIsDownloading,
    setProcessingState,
    resetDropzone,
  };
};

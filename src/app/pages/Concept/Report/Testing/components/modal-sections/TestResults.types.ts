// Import execution state type
interface ISyntheticExecutionState {
  status:
    | 'idle'
    | 'running'
    | 'cancelling'
    | 'completed'
    | 'error'
    | 'cancelled';
  progress: number;
  message: string;
  currentPersona?: string;
  totalPersonas?: number;
  error?: string;
  executionId?: string;
}

export interface TestResultsProps {
  conceptUuid?: string;
  testUuid?: string;
  onResultsChange?: (hasResults: boolean, hasRecommendations: boolean) => void;
  isViewMode?: boolean;
  executionState?: ISyntheticExecutionState; // Add execution state for progress coordination
}

export interface ConfirmationDialogState {
  isOpen: boolean;
  type: 'deleteResult' | 'deleteFile' | 'deleteAll';
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
}

export type ViewMode = 'structured' | 'raw';

export interface ViewModeState {
  [resultUuid: string]: ViewMode;
}

export interface TestResultCardProps {
  result: any; // ITestResult from API types
  viewMode: ViewMode;
  onToggleViewMode: (resultUuid: string) => void;
  onDeleteResult: (resultUuid: string, resultTitle: string) => void;
  onDeleteFile: (
    resultUuid: string,
    fileUuid: string,
    fileName: string,
  ) => void;
  canDelete: boolean;
  isProcessingComplete: boolean;
}

export interface TestResultsHeaderProps {
  resultsCount: number;
  hasResults: boolean;
  hasSyntheticResults: boolean;
  canDelete: boolean;
  onDownloadResults: () => void;
  onDeleteAll: () => void;
  isDownloading: boolean;
  isDeletingAll: boolean;
}

export interface TestResultsUploadZoneProps {
  hasResults: boolean;
  onFilesUpload: (files: UploadedFile[]) => Promise<void>;
  dropzoneKey: number;
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  description: string;
}

export interface TestResultsKeyLearningsProps {
  results: any[]; // ITestResult[]
}

export interface TestResultsConfirmationDialogProps {
  confirmationDialog: ConfirmationDialogState | null;
  onClose: () => void;
  isDeletingAll: boolean;
}

export interface SyntheticResultViewProps {
  result: any; // ITestResult with synthetic fields
  viewMode: ViewMode;
  onToggleViewMode: (resultUuid: string) => void;
}

export interface RegularResultViewProps {
  result: any; // ITestResult
  canDelete: boolean;
  isProcessingComplete: boolean;
  onDeleteFile: (
    resultUuid: string,
    fileUuid: string,
    fileName: string,
  ) => void;
}

import { IMagicShareProgressMessage } from '@libs/api/types';

export interface IMagicShareErrorState {
  message: string;
  errorCode?: string;
  details?: any;
}

export interface IMagicShareProgressState {
  conceptUuid: string;
  stage: IMagicShareProgressMessage['stage'] | 'error';
  message: string;
  progress?: number;
  timestamp: number;
  snapshotUrl?: string;
  magicShareUuid?: string;
  error?: IMagicShareErrorState;
  shouldEmail?: boolean; // Track if user has requested email when generation completes
}

export interface IMagicShareActions {
  setShareProgress: (
    conceptUuid: string,
    stage: IMagicShareProgressState['stage'],
    message: string,
    progress?: number,
    snapshotUrl?: string,
    magicShareUuid?: string,
  ) => void;
  setShareError: (
    conceptUuid: string,
    message: string,
    errorCode?: string,
    details?: any,
  ) => void;
  setShouldEmail: (conceptUuid: string, shouldEmail: boolean) => void;
  clearShareProgress: (conceptUuid: string) => void;
  clearAllShareProgress: () => void;
  getShareProgress: (
    conceptUuid: string,
  ) => IMagicShareProgressState | undefined;
}

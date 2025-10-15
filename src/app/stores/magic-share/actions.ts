import { IMagicShareProgressMessage } from '@libs/api/types';

export interface IMagicShareProgressState {
  conceptUuid: string;
  stage: IMagicShareProgressMessage['stage'];
  message: string;
  progress?: number;
  timestamp: number;
  snapshotUrl?: string;
}

export interface IMagicShareActions {
  setShareProgress: (
    conceptUuid: string,
    stage: IMagicShareProgressState['stage'],
    message: string,
    progress?: number,
    snapshotUrl?: string,
  ) => void;
  clearShareProgress: (conceptUuid: string) => void;
  clearAllShareProgress: () => void;
  getShareProgress: (
    conceptUuid: string,
  ) => IMagicShareProgressState | undefined;
}

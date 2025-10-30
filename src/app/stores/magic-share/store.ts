import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IMagicShareActions, IMagicShareProgressState } from './actions';

export interface IMagicShareState extends IMagicShareActions {
  // Map of concept UUID to progress state
  shareProgressByConcept: Record<string, IMagicShareProgressState>;
}

const magicShareSlice: Lens<IMagicShareState, IAppStore> = (set, get) => {
  return {
    shareProgressByConcept: {},

    setShareProgress: (
      conceptUuid,
      stage,
      message,
      progress,
      snapshotUrl,
      magicShareUuid,
    ) => {
      const currentState = get();
      const existingProgress = currentState.shareProgressByConcept[conceptUuid];

      set({
        ...currentState,
        shareProgressByConcept: {
          ...currentState.shareProgressByConcept,
          [conceptUuid]: {
            conceptUuid,
            stage,
            message,
            progress,
            snapshotUrl,
            magicShareUuid,
            timestamp: Date.now(),
            // Preserve shouldEmail flag from existing state
            shouldEmail: existingProgress?.shouldEmail,
          },
        },
      });
    },

    setShareError: (conceptUuid, message, errorCode, details) => {
      const currentState = get();
      const existingProgress = currentState.shareProgressByConcept[conceptUuid];

      set({
        ...currentState,
        shareProgressByConcept: {
          ...currentState.shareProgressByConcept,
          [conceptUuid]: {
            conceptUuid,
            stage: 'error',
            message,
            progress: 0,
            timestamp: Date.now(),
            error: {
              message,
              errorCode,
              details,
            },
            // Preserve shouldEmail flag from existing state
            shouldEmail: existingProgress?.shouldEmail,
          },
        },
      });
    },

    setShouldEmail: (conceptUuid, shouldEmail) => {
      const currentState = get();
      const existingProgress = currentState.shareProgressByConcept[conceptUuid];

      if (existingProgress) {
        set({
          ...currentState,
          shareProgressByConcept: {
            ...currentState.shareProgressByConcept,
            [conceptUuid]: {
              ...existingProgress,
              shouldEmail,
              timestamp: Date.now(),
            },
          },
        });
      }
    },

    clearShareProgress: (conceptUuid) => {
      const currentState = get();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [conceptUuid]: _removed, ...rest } =
        currentState.shareProgressByConcept;
      set({
        ...currentState,
        shareProgressByConcept: rest,
      });
    },

    clearAllShareProgress: () => {
      const currentState = get();
      set({
        ...currentState,
        shareProgressByConcept: {},
      });
    },

    getShareProgress: (conceptUuid) => {
      const currentState = get();
      return currentState.shareProgressByConcept[conceptUuid];
    },
  };
};

export default lens<IMagicShareState, IAppStore>(magicShareSlice);

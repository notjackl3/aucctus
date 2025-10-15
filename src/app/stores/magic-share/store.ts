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

    setShareProgress: (conceptUuid, stage, message, progress, snapshotUrl) => {
      const currentState = get();
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
            timestamp: Date.now(),
          },
        },
      });
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

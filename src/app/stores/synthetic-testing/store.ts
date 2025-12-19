import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';

export interface ISyntheticTestingState {
  isModalOpen: boolean;
  lastExecutionState: {
    conceptUuid?: string;
    testUuid?: string;
    executionId?: string;
    progress?: number;
    message?: string;
    startTime?: number;
    conceptTitle?: string;
  } | null;
  setModalOpen: (isOpen: boolean) => void;
  setLastExecutionState: (
    state: ISyntheticTestingState['lastExecutionState'],
  ) => void;
}

export const initialSyntheticTestingState = {
  isModalOpen: false,
  lastExecutionState: null,
};

const syntheticTestingSlice: Lens<ISyntheticTestingState, IAppStore> = (
  set,
  get,
) => {
  return {
    isModalOpen: false,
    lastExecutionState: null,

    setModalOpen: (isOpen: boolean) => {
      const currentState = get();
      set({
        ...currentState,
        isModalOpen: isOpen,
      });
    },

    setLastExecutionState: (state) => {
      const currentState = get();
      set({
        ...currentState,
        lastExecutionState: state,
      });
    },
  };
};

export default lens<ISyntheticTestingState, IAppStore>(syntheticTestingSlice);

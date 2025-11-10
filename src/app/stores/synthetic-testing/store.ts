import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';

export interface ISyntheticTestingState {
  isModalOpen: boolean;
  lastExecutionState: {
    conceptUuid?: string;
    testUuid?: string;
    progress?: number;
    message?: string;
    startTime?: number;
  } | null;
  setModalOpen: (isOpen: boolean) => void;
  setLastExecutionState: (
    state: ISyntheticTestingState['lastExecutionState'],
  ) => void;
}

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

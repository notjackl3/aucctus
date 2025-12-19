import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IDebugModeActions } from './actions';

export interface IDebugModeState extends IDebugModeActions {
  isDebugModeEnabled: boolean;
}

// Export initial state for use in store and reset functionality
export const initialDebugModeState = {
  isDebugModeEnabled: false,
};

const debugModeSlice: Lens<IDebugModeState, IAppStore> = (set, get) => {
  return {
    ...initialDebugModeState,

    toggleDebugMode: () => {
      const currentState = get();
      set({
        ...currentState,
        isDebugModeEnabled: !currentState.isDebugModeEnabled,
      });
    },

    setDebugMode: (enabled: boolean) => {
      const currentState = get();
      set({
        ...currentState,
        isDebugModeEnabled: enabled,
      });
    },
  };
};

export default lens<IDebugModeState, IAppStore>(debugModeSlice);

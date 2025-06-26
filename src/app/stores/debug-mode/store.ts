import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IDebugModeActions } from './actions';

export interface IDebugModeState extends IDebugModeActions {
  isDebugModeEnabled: boolean;
}

const debugModeSlice: Lens<IDebugModeState, IAppStore> = (set, get) => {
  return {
    isDebugModeEnabled: false,

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

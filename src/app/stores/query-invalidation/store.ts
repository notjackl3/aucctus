import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';

export interface IQueryInvalidationState {
  pendingInvalidations: Map<string, NodeJS.Timeout>;
  scheduleDebouncedInvalidation: (
    key: string,
    callback: () => void,
    delayMs: number,
  ) => void;
  cancelInvalidation: (key: string) => void;
  clearAll: () => void;
}

export const initialQueryInvalidationState = {
  pendingInvalidations: new Map(),
};

const queryInvalidationSlice: Lens<IQueryInvalidationState, IAppStore> = (
  set,
  get,
) => {
  return {
    pendingInvalidations: new Map(),

    scheduleDebouncedInvalidation: (key, callback, delayMs) => {
      const state = get();

      // Clear existing timer if one exists for this key
      const existingTimer = state.pendingInvalidations.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Schedule new timer
      const timer = setTimeout(() => {
        callback();
        // Clean up after execution
        set((state) => {
          const newMap = new Map(state.pendingInvalidations);
          newMap.delete(key);
          return { ...state, pendingInvalidations: newMap };
        });
      }, delayMs);

      // Store the timer
      set((state) => {
        const newMap = new Map(state.pendingInvalidations);
        newMap.set(key, timer);
        return { ...state, pendingInvalidations: newMap };
      });
    },

    cancelInvalidation: (key) => {
      const state = get();
      const timer = state.pendingInvalidations.get(key);
      if (timer) {
        clearTimeout(timer);
        set((state) => {
          const newMap = new Map(state.pendingInvalidations);
          newMap.delete(key);
          return { ...state, pendingInvalidations: newMap };
        });
      }
    },

    clearAll: () => {
      const state = get();
      // Clear all timers
      state.pendingInvalidations.forEach((timer) => clearTimeout(timer));
      set({ ...state, pendingInvalidations: new Map() });
    },
  };
};

export default lens<IQueryInvalidationState, IAppStore>(queryInvalidationSlice);

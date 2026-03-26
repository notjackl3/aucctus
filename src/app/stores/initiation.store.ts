import { create } from 'zustand';

interface IInitiationStore {
  /** Whether an initiation/first-run screen is currently displayed */
  isShowingInitiation: boolean;
  setShowingInitiation: (showing: boolean) => void;
}

/**
 * Lightweight store to broadcast initiation screen state to the app shell.
 * Used by Private layout to hide the floating search bar during first-run screens.
 */
export const useInitiationStore = create<IInitiationStore>()((set) => ({
  isShowingInitiation: false,
  setShowingInitiation: (showing: boolean) =>
    set({ isShowingInitiation: showing }),
}));

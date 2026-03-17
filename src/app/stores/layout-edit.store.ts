import { create } from 'zustand';

interface ILayoutEditStore {
  /** Whether a layout edit mode is active (e.g. persona widget grid editing) */
  isEditingLayout: boolean;
  setEditingLayout: (editing: boolean) => void;
}

/**
 * Lightweight store to broadcast layout edit mode to the app shell.
 * Used by Private layout to hide the floating search bar during editing.
 */
export const useLayoutEditStore = create<ILayoutEditStore>()((set) => ({
  isEditingLayout: false,
  setEditingLayout: (editing: boolean) => set({ isEditingLayout: editing }),
}));

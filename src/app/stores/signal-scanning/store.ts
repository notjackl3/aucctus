import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import type {
  SignalTheme,
  SignalStance,
  SignalStatus,
  SignalImpact,
} from '@libs/api/types';

// Feed item types for unified feed filtering
export type FeedItemType = 'signal' | 'opportunity' | 'intelligence' | 'all';

export interface ISignalScanningFilters {
  themes: SignalTheme[];
  stances: SignalStance[];
  statuses: SignalStatus[];
  impacts: SignalImpact[];
  search: string;
  feedItemType: FeedItemType;
  dateRange: {
    from?: string;
    to?: string;
  };
}

export interface ISignalScanningState {
  // Filter state
  filters: ISignalScanningFilters;
  setFilters: (filters: Partial<ISignalScanningFilters>) => void;
  resetFilters: () => void;

  // Selection state (for bulk actions)
  selectedSignalUuids: string[];
  toggleSignalSelection: (uuid: string) => void;
  selectAllSignals: (uuids: string[]) => void;
  clearSelection: () => void;

  // View preferences
  signalsSortBy: 'relevance' | 'date' | 'confidence';
  signalsSortDirection: 'asc' | 'desc';
  setSortPreferences: (
    sortBy: ISignalScanningState['signalsSortBy'],
    direction: ISignalScanningState['signalsSortDirection'],
  ) => void;
}

export const initialSignalScanningFilters: ISignalScanningFilters = {
  themes: [],
  stances: [],
  statuses: [],
  impacts: [],
  search: '',
  feedItemType: 'all',
  dateRange: {},
};

export const initialSignalScanningState = {
  filters: initialSignalScanningFilters,
  selectedSignalUuids: [] as string[],
  signalsSortBy: 'relevance' as const,
  signalsSortDirection: 'desc' as const,
};

const signalScanningSlice: Lens<ISignalScanningState, IAppStore> = (
  set,
  get,
) => {
  return {
    ...initialSignalScanningState,

    setFilters: (newFilters: Partial<ISignalScanningFilters>) => {
      const currentState = get();
      set({
        ...currentState,
        filters: {
          ...currentState.filters,
          ...newFilters,
        },
      });
    },

    resetFilters: () => {
      const currentState = get();
      set({
        ...currentState,
        filters: initialSignalScanningFilters,
      });
    },

    toggleSignalSelection: (uuid: string) => {
      const currentState = get();
      const isSelected = currentState.selectedSignalUuids.includes(uuid);
      set({
        ...currentState,
        selectedSignalUuids: isSelected
          ? currentState.selectedSignalUuids.filter((id) => id !== uuid)
          : [...currentState.selectedSignalUuids, uuid],
      });
    },

    selectAllSignals: (uuids: string[]) => {
      const currentState = get();
      set({
        ...currentState,
        selectedSignalUuids: uuids,
      });
    },

    clearSelection: () => {
      const currentState = get();
      set({
        ...currentState,
        selectedSignalUuids: [],
      });
    },

    setSortPreferences: (
      sortBy: ISignalScanningState['signalsSortBy'],
      direction: ISignalScanningState['signalsSortDirection'],
    ) => {
      const currentState = get();
      set({
        ...currentState,
        signalsSortBy: sortBy,
        signalsSortDirection: direction,
      });
    },
  };
};

export default lens<ISignalScanningState, IAppStore>(signalScanningSlice);

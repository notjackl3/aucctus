/**
 * Strategic Foresight Store (V2)
 *
 * Simplified state for executive-focused view.
 * Key changes from original store:
 * - Classification filter (threat/opportunity/watch) instead of status workflow
 * - Single insight selection for detail panel
 * - Minimal view preferences for executive dashboard
 */

import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import type {
  InsightClassification,
  TimeHorizon,
} from '@libs/api/types/strategicForesight';

// ============================================
// State Types
// ============================================

export interface IStrategicForesightFilters {
  classification: InsightClassification | 'all';
  timeHorizons: TimeHorizon[];
  businessUnits: string[];
  search: string;
}

export interface IStrategicForesightState {
  // Filter state (simplified for executive view)
  filters: IStrategicForesightFilters;
  setFilters: (filters: Partial<IStrategicForesightFilters>) => void;
  setClassificationFilter: (
    classification: InsightClassification | 'all',
  ) => void;
  resetFilters: () => void;

  // Selection state
  selectedInsightUuid: string | null;
  selectInsight: (uuid: string | null) => void;

  // View preferences
  feedExpanded: boolean;
  toggleFeedExpanded: () => void;
}

// ============================================
// Initial State
// ============================================

export const initialStrategicForesightFilters: IStrategicForesightFilters = {
  classification: 'all',
  timeHorizons: [],
  businessUnits: [],
  search: '',
};

export const initialStrategicForesightState = {
  filters: initialStrategicForesightFilters,
  selectedInsightUuid: null as string | null,
  feedExpanded: false,
};

// ============================================
// Store Slice
// ============================================

const strategicForesightSlice: Lens<IStrategicForesightState, IAppStore> = (
  set,
  get,
) => {
  return {
    ...initialStrategicForesightState,

    setFilters: (newFilters: Partial<IStrategicForesightFilters>) => {
      const currentState = get();
      set({
        ...currentState,
        filters: {
          ...currentState.filters,
          ...newFilters,
        },
      });
    },

    setClassificationFilter: (
      classification: InsightClassification | 'all',
    ) => {
      const currentState = get();
      set({
        ...currentState,
        filters: {
          ...currentState.filters,
          classification,
        },
      });
    },

    resetFilters: () => {
      const currentState = get();
      set({
        ...currentState,
        filters: initialStrategicForesightFilters,
      });
    },

    selectInsight: (uuid: string | null) => {
      const currentState = get();
      set({
        ...currentState,
        selectedInsightUuid: uuid,
      });
    },

    toggleFeedExpanded: () => {
      const currentState = get();
      set({
        ...currentState,
        feedExpanded: !currentState.feedExpanded,
      });
    },
  };
};

export default lens<IStrategicForesightState, IAppStore>(
  strategicForesightSlice,
);

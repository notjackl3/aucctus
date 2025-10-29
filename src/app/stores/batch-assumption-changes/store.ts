import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { IAssumptionV2, AssumptionCategory } from '@libs/api/types';
import {
  IBatchAssumptionChangesActions,
  createBatchAssumptionChangesActions,
} from './actions';

// Types for batch changes
export interface BatchAssumptionChange {
  id: string; // For new assumptions, use temp ID; for existing, use assumption UUID
  type: 'add' | 'edit' | 'delete';
  originalData?: IAssumptionV2; // For edits and deletes, store original data
  changes?: {
    // Optional for deletes
    statement: string;
    category: AssumptionCategory;
    importance: number; // 0-1 range (frontend format)
    certainty: number; // 0-1 range (frontend format)
  };
  timestamp: number;
}

export interface BatchAssumptionState {
  changes: Record<string, BatchAssumptionChange>;
  conceptId: string | null;
}

export interface IBatchAssumptionChangesState
  extends IBatchAssumptionChangesActions {
  // State
  batchChanges: Record<string, BatchAssumptionChange>;
  conceptId: string | null;
}

const useBatchAssumptionChangesStore = create<IBatchAssumptionChangesState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Initial state
      batchChanges: {},
      conceptId: null,

      // Actions
      ...createBatchAssumptionChangesActions(set, get),
    })),
    {
      name: 'batch-assumption-changes',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useBatchAssumptionChangesStore;

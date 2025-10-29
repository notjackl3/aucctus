import { IAssumptionV2 } from '@libs/api/types';
import { BatchAssumptionChange } from './store';

interface BatchAssumptionChangesState {
  batchChanges: Record<string, BatchAssumptionChange>;
  conceptId: string | null;
}

export interface IBatchAssumptionChangesActions {
  setConceptId: (conceptId: string) => void;
  addChange: (change: Omit<BatchAssumptionChange, 'timestamp'>) => void;
  removeChange: (id: string) => void;
  clearChanges: () => void;
  clearChangesForConcept: (conceptId: string) => void;
  hasUnsavedChanges: () => boolean;
  unsavedChangesCount: () => number;
  changesArray: () => BatchAssumptionChange[];
  getChange: (id: string) => BatchAssumptionChange | null;
  hasChangeForAssumption: (assumptionId: string) => boolean;
  getEffectiveAssumptionData: (assumption: IAssumptionV2) => IAssumptionV2;
  isMarkedForDeletion: (assumptionId: string) => boolean;
  getNewAssumptions: () => BatchAssumptionChange[];
}

export const createBatchAssumptionChangesActions = (
  set: (partial: any) => void,
  get: () => BatchAssumptionChangesState,
): IBatchAssumptionChangesActions => ({
  setConceptId: (conceptId: string) => {
    set({ conceptId });
  },

  addChange: (change: Omit<BatchAssumptionChange, 'timestamp'>) => {
    set((state: { batchChanges: Record<string, BatchAssumptionChange> }) => ({
      batchChanges: {
        ...state.batchChanges,
        [change.id]: {
          ...change,
          timestamp: Date.now(),
        },
      },
    }));
  },

  removeChange: (id: string) => {
    set((state: { batchChanges: Record<string, BatchAssumptionChange> }) => {
      const newChanges = { ...state.batchChanges };
      delete newChanges[id];
      return { batchChanges: newChanges };
    });
  },

  clearChanges: () => {
    set({ batchChanges: {} });
  },

  clearChangesForConcept: (conceptId: string) => {
    const state = get();
    if (state.conceptId === conceptId) {
      set({ batchChanges: {} });
    }
  },

  hasUnsavedChanges: () => {
    return Object.keys(get().batchChanges).length > 0;
  },

  unsavedChangesCount: () => {
    return Object.keys(get().batchChanges).length;
  },

  changesArray: () => {
    return Object.values(get().batchChanges);
  },

  getChange: (id: string) => {
    return get().batchChanges[id] || null;
  },

  hasChangeForAssumption: (assumptionId: string) => {
    return !!get().batchChanges[assumptionId];
  },

  getEffectiveAssumptionData: (assumption: IAssumptionV2) => {
    const state = get();
    const change = state.batchChanges[assumption.uuid];
    if (!change || change.type === 'delete') return assumption;
    if (!change.changes) return assumption; // Safety check

    return {
      ...assumption,
      statement: change.changes.statement,
      category: change.changes.category,
      importance: change.changes.importance,
      certainty: change.changes.certainty,
    };
  },

  isMarkedForDeletion: (assumptionId: string) => {
    const change = get().batchChanges[assumptionId];
    return change?.type === 'delete';
  },

  getNewAssumptions: () => {
    return Object.values(get().batchChanges).filter(
      (change) => change.type === 'add',
    );
  },
});

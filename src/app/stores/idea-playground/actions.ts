import { produce } from 'immer';
import type { IStoreApi } from '../store';
import type { IIdeaPlaygroundState } from './store';

/**
 * Minimal Idea Playground Actions
 *
 * Only UI state actions - no data management.
 * All data operations should use React Query mutations.
 */
export interface IIdeaPlaygroundActions {
  setCurrentQuestionIndex: (index: number) => void;
  toggleConceptSelection: (conceptUuid: string) => void;
  clearSelectedConcepts: () => void;
  setLastActiveSeedUuid: (seedUuid: string | null) => void;
  clearLastActiveSeedUuid: () => void;
  reset: () => void;
}

export function setCurrentQuestionIndex(
  this: IStoreApi<IIdeaPlaygroundState>,
  index: number,
) {
  const { set } = this;
  set(
    produce((state: IIdeaPlaygroundState) => {
      state.currentQuestionIndex = index;
    }),
  );
}

export function toggleConceptSelection(
  this: IStoreApi<IIdeaPlaygroundState>,
  conceptUuid: string,
) {
  const { set } = this;
  set(
    produce((state: IIdeaPlaygroundState) => {
      const index = state.selectedConceptUuids.indexOf(conceptUuid);
      if (index > -1) {
        // Remove if already selected
        state.selectedConceptUuids.splice(index, 1);
      } else {
        // Add if not selected
        state.selectedConceptUuids.push(conceptUuid);
      }
    }),
  );
}

export function clearSelectedConcepts(this: IStoreApi<IIdeaPlaygroundState>) {
  const { set } = this;
  set(
    produce((state: IIdeaPlaygroundState) => {
      state.selectedConceptUuids = [];
    }),
  );
}

export function setLastActiveSeedUuid(
  this: IStoreApi<IIdeaPlaygroundState>,
  seedUuid: string | null,
) {
  const { set } = this;
  set(
    produce((state: IIdeaPlaygroundState) => {
      state.lastActiveSeedUuid = seedUuid;
    }),
  );
}

export function clearLastActiveSeedUuid(this: IStoreApi<IIdeaPlaygroundState>) {
  const { set } = this;
  set(
    produce((state: IIdeaPlaygroundState) => {
      state.lastActiveSeedUuid = null;
    }),
  );
}

export function reset(this: IStoreApi<IIdeaPlaygroundState>) {
  const { set } = this;
  set(
    produce((state: IIdeaPlaygroundState) => {
      state.currentQuestionIndex = 0;
      state.selectedConceptUuids = [];
      // Note: lastActiveSeedUuid is intentionally NOT cleared on reset
      // It should only be cleared explicitly via clearLastActiveSeedUuid
    }),
  );
}

import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import {
  IIdeaPlaygroundActions,
  setCurrentQuestionIndex,
  toggleConceptSelection,
  clearSelectedConcepts,
  setLastActiveSeedUuid,
  clearLastActiveSeedUuid,
  setPrepopulatedAnchorThought,
  clearPrepopulatedAnchorThought,
  reset,
} from './actions';

/**
 * Minimal Idea Playground Store
 *
 * This store only contains UI state that isn't persisted to the API.
 * All data (questions, answers, insights, concepts) is managed by React Query.
 *
 * What's stored here:
 * - currentQuestionIndex: Carousel navigation state
 * - selectedConceptUuids: Temporary selections before saving to API
 * - lastActiveSeedUuid: Cached seed UUID for session restoration
 *
 * What's NOT stored here (use React Query hooks instead):
 * - currentSeedUuid → Use URL params or page-level useState
 * - questions → useQuestions(seedUuid)
 * - possibleAnswers → questions[n].possibleAnswers
 * - researchInsights → questions[n].researchInsights
 * - userAnswers → questions[n].userAnswer
 * - generatedConcepts → useConcepts(seedUuid) or query data
 * - loading states → React Query provides isLoading, isFetching
 */
export interface IIdeaPlaygroundState extends IIdeaPlaygroundActions {
  // UI Navigation State
  currentQuestionIndex: number;

  // Temporary UI State (selections not yet saved to API)
  selectedConceptUuids: string[];

  // Session Restoration State (persisted to session storage)
  // Used to restore the active seed when returning to playground via navigation
  lastActiveSeedUuid: string | null;

  // Prepopulated anchor thought from external navigation (e.g., Signal Scanning)
  // Cleared after consumption by IdeaPlayground
  prepopulatedAnchorThought: string | null;
}

export const initialIdeaPlaygroundState = {
  currentQuestionIndex: 0,
  selectedConceptUuids: [],
  lastActiveSeedUuid: null,
  prepopulatedAnchorThought: null,
};

const ideaPlaygroundSlice: Lens<IIdeaPlaygroundState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    // Initial state
    currentQuestionIndex: 0,
    selectedConceptUuids: [],
    lastActiveSeedUuid: null,
    prepopulatedAnchorThought: null,

    // Actions - bound to actionContext
    setCurrentQuestionIndex: setCurrentQuestionIndex.bind(actionContext),
    toggleConceptSelection: toggleConceptSelection.bind(actionContext),
    clearSelectedConcepts: clearSelectedConcepts.bind(actionContext),
    setLastActiveSeedUuid: setLastActiveSeedUuid.bind(actionContext),
    clearLastActiveSeedUuid: clearLastActiveSeedUuid.bind(actionContext),
    setPrepopulatedAnchorThought:
      setPrepopulatedAnchorThought.bind(actionContext),
    clearPrepopulatedAnchorThought:
      clearPrepopulatedAnchorThought.bind(actionContext),
    reset: reset.bind(actionContext),
  };
};

export default lens<IIdeaPlaygroundState, IAppStore>(ideaPlaygroundSlice);

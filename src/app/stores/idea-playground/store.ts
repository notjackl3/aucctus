import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import {
  IIdeaPlaygroundActions,
  setCurrentQuestionIndex,
  toggleConceptSelection,
  clearSelectedConcepts,
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
}

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

    // Actions - bound to actionContext
    setCurrentQuestionIndex: setCurrentQuestionIndex.bind(actionContext),
    toggleConceptSelection: toggleConceptSelection.bind(actionContext),
    clearSelectedConcepts: clearSelectedConcepts.bind(actionContext),
    reset: reset.bind(actionContext),
  };
};

export default lens<IIdeaPlaygroundState, IAppStore>(ideaPlaygroundSlice);

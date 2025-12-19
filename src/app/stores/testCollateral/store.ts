import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import {
  CollateralFeedbackProcessingState,
  ITestCollateralActions,
  setCollateralFeedbackProcessingState,
  clearCollateralFeedbackProcessingState,
  clearAllCollateralFeedbackStatesForTest,
  checkAndClearCompletedFeedback,
} from './actions';

export interface ITestCollateralState extends ITestCollateralActions {
  // Map of collateralUuid -> processingState
  collateralFeedbackStates: Record<string, CollateralFeedbackProcessingState>;
}

// Export initial state for use in store and reset functionality
export const initialTestCollateralState = {
  collateralFeedbackStates: {} as Record<
    string,
    CollateralFeedbackProcessingState
  >,
};

const testCollateralSlice: Lens<ITestCollateralState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    // State
    ...initialTestCollateralState,

    // Actions
    setCollateralFeedbackProcessingState:
      setCollateralFeedbackProcessingState.bind(actionContext),
    clearCollateralFeedbackProcessingState:
      clearCollateralFeedbackProcessingState.bind(actionContext),
    clearAllCollateralFeedbackStatesForTest:
      clearAllCollateralFeedbackStatesForTest.bind(actionContext),
    checkAndClearCompletedFeedback:
      checkAndClearCompletedFeedback.bind(actionContext),
  };
};

export default lens<ITestCollateralState, IAppStore>(testCollateralSlice);
export type { CollateralFeedbackProcessingState };

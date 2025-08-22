import type { IStoreApi } from '../store';

export interface CollateralFeedbackProcessingState {
  isProcessing: boolean;
  progress: number;
  message: string;
  stage?: string;
  error: string | null;
  collateralUuid?: string;
  submittedAt?: string; // updatedAt time when feedback was submitted
}

export interface ITestCollateralActions {
  setCollateralFeedbackProcessingState: (
    collateralUuid: string,
    state: CollateralFeedbackProcessingState,
  ) => void;
  clearCollateralFeedbackProcessingState: (collateralUuid: string) => void;
  clearAllCollateralFeedbackStatesForTest: (testUuid: string) => void;
  checkAndClearCompletedFeedback: (
    collateralUuid: string,
    currentUpdatedAt: string,
  ) => boolean;
}

export function setCollateralFeedbackProcessingState(
  this: IStoreApi<any>,
  collateralUuid: string,
  state: CollateralFeedbackProcessingState,
) {
  this.set((current: any) => ({
    ...current,
    collateralFeedbackStates: {
      ...current.collateralFeedbackStates,
      [collateralUuid]: state,
    },
  }));
}

export function clearCollateralFeedbackProcessingState(
  this: IStoreApi<any>,
  collateralUuid: string,
) {
  this.set((current: any) => {
    const allStates = {
      ...current.collateralFeedbackStates,
    };
    delete allStates[collateralUuid];

    return {
      ...current,
      collateralFeedbackStates: allStates,
    };
  });
}

export function clearAllCollateralFeedbackStatesForTest(
  this: IStoreApi<any>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _testUuid: string,
) {
  // For simplified structure, we need to filter out states for this specific test
  // Since we don't store testUuid in the state anymore, we'll clear all states
  // This function may need to be called less frequently or removed
  this.set((current: any) => ({
    ...current,
    collateralFeedbackStates: {},
  }));
}

/**
 * Check if a collateral item's updatedAt time has changed since feedback was submitted.
 * If it has changed, assume processing is complete and clear the processing state.
 * If it hasn't changed in 20+ minutes, assume something failed.
 * @param collateralUuid - The UUID of the collateral item
 * @param currentUpdatedAt - The current updatedAt time from the API
 * @returns true if processing state was cleared, false otherwise
 */
export function checkAndClearCompletedFeedback(
  this: IStoreApi<any>,
  collateralUuid: string,
  currentUpdatedAt: string,
): boolean {
  const current = this.get();
  const currentState = current.collateralFeedbackStates?.[collateralUuid];

  // Only check if currently processing and we have a submitted timestamp
  if (currentState?.isProcessing && currentState?.submittedAt) {
    const now = new Date();
    const submittedTime = new Date(currentState.submittedAt);
    const timeDiffMinutes =
      (now.getTime() - submittedTime.getTime()) / (1000 * 60);

    // If the updatedAt time has changed, assume processing is complete (success)
    if (currentUpdatedAt !== currentState.submittedAt) {
      this.set((current: any) => ({
        ...current,
        collateralFeedbackStates: {
          ...current.collateralFeedbackStates,
          [collateralUuid]: {
            ...currentState,
            isProcessing: false,
            progress: 100,
            message: 'Feedback processed successfully!',
            stage: 'completed',
            error: null,
          },
        },
      }));
      return true;
    }
    // If updatedAt hasn't changed in 20+ minutes, assume failure
    else if (timeDiffMinutes >= 20) {
      this.set((current: any) => ({
        ...current,
        collateralFeedbackStates: {
          ...current.collateralFeedbackStates,
          [collateralUuid]: {
            ...currentState,
            isProcessing: false,
            progress: 0,
            message: '',
            stage: 'timeout_error',
            error:
              'Processing timeout - no response received within 20 minutes',
          },
        },
      }));
      return true;
    }
  }

  return false;
}

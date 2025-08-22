import type { IAppStore } from '../store';
import type { CollateralFeedbackProcessingState } from './store';

/**
 * Get the feedback processing state for a specific collateral item
 */
export const getCollateralFeedbackProcessingState = (
  state: IAppStore,
  collateralUuid: string,
): CollateralFeedbackProcessingState | undefined => {
  return state.testCollateral?.collateralFeedbackStates?.[collateralUuid];
};

/**
 * Get all feedback processing states
 */
export const getAllCollateralFeedbackStates = (
  state: IAppStore,
): Record<string, CollateralFeedbackProcessingState> => {
  return state.testCollateral?.collateralFeedbackStates || {};
};

/**
 * Check if any collateral is currently processing feedback
 */
export const hasAnyProcessingCollateralFeedback = (
  state: IAppStore,
): boolean => {
  const allStates = state.testCollateral?.collateralFeedbackStates;
  if (!allStates) return false;

  return Object.values(allStates).some(
    (processingState) => processingState.isProcessing,
  );
};

/**
 * Get processing collateral UUIDs
 */
export const getProcessingCollateralUuids = (state: IAppStore): string[] => {
  const allStates = state.testCollateral?.collateralFeedbackStates;
  if (!allStates) return [];

  return Object.entries(allStates)
    .filter(([, processingState]) => processingState.isProcessing)
    .map(([uuid]) => uuid);
};

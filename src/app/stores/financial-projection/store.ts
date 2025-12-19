import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import {
  IFinancialProjectionV2,
  IMarketSizingAssumptionEntryV2,
  IImpactSizingAssumptionEntryV2,
} from '@libs/api/types';
import {
  IFinancialProjectionActions,
  setActiveFinancialProjection,
  setMarketSizingAssumptions,
  resetMarketSizingAssumptions,
  setImpactSizingAssumptions,
  resetImpactSizingAssumptions,
} from './actions';

export interface IFinancialProjectionState extends IFinancialProjectionActions {
  // The currently active financial projection
  activeFinancialProjection: IFinancialProjectionV2 | undefined;

  // Persisted assumptions by marketSizing uuid
  marketSizingAssumptions: Record<string, IMarketSizingAssumptionEntryV2[]>;

  // Persisted assumptions by impactSizing uuid
  impactSizingAssumptions: Record<string, IImpactSizingAssumptionEntryV2[]>;
}

// Export initial state for use in store and reset functionality
export const initialFinancialProjectionState = {
  activeFinancialProjection: undefined as IFinancialProjectionV2 | undefined,
  marketSizingAssumptions: {} as Record<
    string,
    IMarketSizingAssumptionEntryV2[]
  >,
  impactSizingAssumptions: {} as Record<
    string,
    IImpactSizingAssumptionEntryV2[]
  >,
};

const financialProjectionSlice: Lens<IFinancialProjectionState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    ...initialFinancialProjectionState,
    setActiveFinancialProjection:
      setActiveFinancialProjection.bind(actionContext),
    setMarketSizingAssumptions: setMarketSizingAssumptions.bind(actionContext),
    resetMarketSizingAssumptions:
      resetMarketSizingAssumptions.bind(actionContext),
    setImpactSizingAssumptions: setImpactSizingAssumptions.bind(actionContext),
    resetImpactSizingAssumptions:
      resetImpactSizingAssumptions.bind(actionContext),
  };
};

export default lens<IFinancialProjectionState, IAppStore>(
  financialProjectionSlice,
);

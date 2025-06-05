import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IFinancialProjectionV2 } from '@libs/api/types';
import {
  IFinancialProjectionActions,
  setActiveFinancialProjection,
} from './actions';

export interface IFinancialProjectionState extends IFinancialProjectionActions {
  // The currently active financial projection
  activeFinancialProjection: IFinancialProjectionV2 | undefined;
}

const financialProjectionSlice: Lens<IFinancialProjectionState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    activeFinancialProjection: undefined,
    setActiveFinancialProjection:
      setActiveFinancialProjection.bind(actionContext),
  };
};

export default lens<IFinancialProjectionState, IAppStore>(
  financialProjectionSlice,
);

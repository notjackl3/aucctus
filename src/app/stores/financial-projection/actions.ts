import { produce } from 'immer';
import type { IStoreApi } from '../store';
import { IFinancialProjectionState } from './store';
import { IFinancialProjectionV2 } from '@libs/api/types';

export interface IFinancialProjectionActions {
  setActiveFinancialProjection: (
    activeFinancialProjection: IFinancialProjectionV2,
  ) => void;
}

export function setActiveFinancialProjection(
  this: IStoreApi<IFinancialProjectionState>,
  activeFinancialProjection: IFinancialProjectionV2,
) {
  const { set } = this;

  set(
    produce((state: IFinancialProjectionState) => {
      state.activeFinancialProjection = activeFinancialProjection;
    }),
  );
}

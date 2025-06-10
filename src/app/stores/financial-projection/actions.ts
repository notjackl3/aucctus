import { produce } from 'immer';
import type { IStoreApi } from '../store';
import { IFinancialProjectionState } from './store';
import {
  IFinancialProjectionV2,
  IMarketSizingAssumptionEntryV2,
  IImpactSizingAssumptionEntryV2,
} from '@libs/api/types';

export interface IFinancialProjectionActions {
  setActiveFinancialProjection: (
    activeFinancialProjection: IFinancialProjectionV2,
  ) => void;
  setMarketSizingAssumptions: (
    marketSizingUuid: string,
    assumptions: IMarketSizingAssumptionEntryV2[],
  ) => void;
  resetMarketSizingAssumptions: (marketSizingUuid: string) => void;
  setImpactSizingAssumptions: (
    impactSizingUuid: string,
    assumptions: IImpactSizingAssumptionEntryV2[],
  ) => void;
  resetImpactSizingAssumptions: (impactSizingUuid: string) => void;
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

export function setMarketSizingAssumptions(
  this: IStoreApi<IFinancialProjectionState>,
  marketSizingUuid: string,
  assumptions: IMarketSizingAssumptionEntryV2[],
) {
  const { set } = this;

  set(
    produce((state: IFinancialProjectionState) => {
      state.marketSizingAssumptions[marketSizingUuid] = assumptions;
    }),
  );
}

export function resetMarketSizingAssumptions(
  this: IStoreApi<IFinancialProjectionState>,
  marketSizingUuid: string,
) {
  const { set } = this;

  set(
    produce((state: IFinancialProjectionState) => {
      delete state.marketSizingAssumptions[marketSizingUuid];
    }),
  );
}

export function setImpactSizingAssumptions(
  this: IStoreApi<IFinancialProjectionState>,
  impactSizingUuid: string,
  assumptions: IImpactSizingAssumptionEntryV2[],
) {
  const { set } = this;

  set(
    produce((state: IFinancialProjectionState) => {
      state.impactSizingAssumptions[impactSizingUuid] = assumptions;
    }),
  );
}

export function resetImpactSizingAssumptions(
  this: IStoreApi<IFinancialProjectionState>,
  impactSizingUuid: string,
) {
  const { set } = this;

  set(
    produce((state: IFinancialProjectionState) => {
      delete state.impactSizingAssumptions[impactSizingUuid];
    }),
  );
}

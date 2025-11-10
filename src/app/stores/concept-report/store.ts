import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IFeatureVersions } from '@libs/api/types';
import {
  IConceptReportActions,
  setConceptUuid,
  setActiveConcept,
  addPendingSections,
  clearPendingSections,
} from './actions';

export interface IConceptReportState extends IConceptReportActions {
  // The currently selected concept uuid
  conceptUuid?: string;
  identifier?: string;
  featureVersions?: IFeatureVersions;
  pendingSectionOverrides?: Record<
    string,
    Record<string, { appliedAt: string }>
  >;
}

const conceptReportSlice: Lens<IConceptReportState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    conceptUuid: undefined,
    identifier: undefined,
    featureVersions: undefined,
    pendingSectionOverrides: {},
    setConceptUuid: setConceptUuid.bind(actionContext),
    setActiveConcept: setActiveConcept.bind(actionContext),
    addPendingSections: addPendingSections.bind(actionContext),
    clearPendingSections: clearPendingSections.bind(actionContext),
  };
};

export default lens<IConceptReportState, IAppStore>(conceptReportSlice);

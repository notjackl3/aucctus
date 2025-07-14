import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IFeatureVersions } from '@libs/api/types';
import {
  IConceptReportActions,
  setConceptUuid,
  setActiveConcept,
} from './actions';

export interface IConceptReportState extends IConceptReportActions {
  // The currently selected concept uuid
  conceptUuid?: string;
  identifier?: string;
  featureVersions?: IFeatureVersions;
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
    setConceptUuid: setConceptUuid.bind(actionContext),
    setActiveConcept: setActiveConcept.bind(actionContext),
  };
};

export default lens<IConceptReportState, IAppStore>(conceptReportSlice);

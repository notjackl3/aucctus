import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { IConceptReportActions, setConceptUuid } from './actions';

export interface IConceptReportState extends IConceptReportActions {
  // The currently selected concept uuid
  conceptUuid?: string;
}

const conceptReportSlice: Lens<IConceptReportState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    conceptUuid: undefined,

    setConceptUuid: setConceptUuid.bind(actionContext),
  };
};

export default lens<IConceptReportState, IAppStore>(conceptReportSlice);

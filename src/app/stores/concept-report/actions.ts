import { produce } from 'immer';
import type { IStoreApi } from '../store';
import { IConceptReportState } from './store';

export interface IConceptReportActions {
  setConceptUuid: (conceptUuid: string | undefined) => void;
}

export function setConceptUuid(
  this: IStoreApi<IConceptReportState>,
  conceptUuid: string | undefined,
) {
  const { set } = this;

  set(
    produce((state: IConceptReportState) => {
      state.conceptUuid = conceptUuid;
    }),
  );
}

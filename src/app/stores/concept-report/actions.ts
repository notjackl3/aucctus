import { produce } from 'immer';
import type { IStoreApi } from '../store';
import { IConceptReportState } from './store';
import { IConcept } from '@libs/api/types';

export interface IConceptReportActions {
  setConceptUuid: (conceptUuid: string | undefined) => void;
  setActiveConcept: (concept: IConcept) => void;
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

export function setActiveConcept(
  this: IStoreApi<IConceptReportState>,
  concept: IConcept,
) {
  const { set } = this;
  set(
    produce((state: IConceptReportState) => {
      state.isHistoricalVersion = concept.isHistoricalVersion;
      state.conceptVersionId = concept.conceptVersionId;
      state.conceptUuid = concept.uuid;
    }),
  );
}

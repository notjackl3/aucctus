import { produce } from 'immer';
import type { IStoreApi } from '../store';
import { IConceptReportState } from './store';
import { IConcept } from '@libs/api/types';

export interface IConceptReportActions {
  setConceptUuid: (conceptUuid: string | undefined) => void;
  setActiveConcept: (concept: IConcept) => void;
  addPendingSections: (
    identifier: string,
    sections: Record<string, string>,
  ) => void;
  clearPendingSections: (identifier: string, sections?: string[]) => void;
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
      state.conceptUuid = concept.uuid;
      state.identifier = concept.identifier;
      state.featureVersions = concept.featureVersions;
    }),
  );
}

export function addPendingSections(
  this: IStoreApi<IConceptReportState>,
  identifier: string,
  sections: Record<string, string>,
) {
  const { set } = this;
  if (!identifier || Object.keys(sections).length === 0) {
    return;
  }

  set(
    produce((state: IConceptReportState) => {
      if (!state.pendingSectionOverrides) {
        state.pendingSectionOverrides = {};
      }
      const existing = state.pendingSectionOverrides[identifier] || {};
      Object.entries(sections).forEach(([sectionKey, appliedAt]) => {
        if (!sectionKey) return;
        existing[sectionKey] = {
          appliedAt: appliedAt || new Date().toISOString(),
        };
      });
      state.pendingSectionOverrides[identifier] = existing;
    }),
  );
}

export function clearPendingSections(
  this: IStoreApi<IConceptReportState>,
  identifier: string,
  sections?: string[],
) {
  const { set } = this;

  if (!identifier) return;

  set(
    produce((state: IConceptReportState) => {
      const overrides = state.pendingSectionOverrides?.[identifier];
      if (!overrides) {
        return;
      }

      if (!sections || sections.length === 0) {
        delete state.pendingSectionOverrides?.[identifier];
        return;
      }

      sections.forEach((sectionKey) => {
        if (!sectionKey) return;
        delete overrides[sectionKey];
      });

      if (Object.keys(overrides).length === 0) {
        delete state.pendingSectionOverrides?.[identifier];
      } else if (state.pendingSectionOverrides) {
        state.pendingSectionOverrides[identifier] = overrides;
      }
    }),
  );
}

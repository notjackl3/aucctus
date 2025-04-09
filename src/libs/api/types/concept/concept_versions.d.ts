export interface IConceptVersionRevertRequestPayload {
  versionId: number;
}

export interface IConceptVersion {
  versionId: number;
  revisionId: number;
  title?: string;
  description?: string;
  comment?: string;
  createdTimestamp?: number;
}

export interface IConceptVersionList {
  versions: IConceptVersion[];
  versionCount: number;
}

/**
 * Schema for individual concept version
 * Note: This interface depends on ConceptVersionSchema which should be defined elsewhere
 */

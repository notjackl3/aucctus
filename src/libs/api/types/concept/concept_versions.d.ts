export interface IConceptVersionRevertRequestPayload {
  versionId: number;
}

export interface IConceptVersion {
  isCurrent?: boolean;
  comment?: string;
  versionNumber: number;
  fromVersionNumber?: number;
  affectedSections?: string[];
  createdAt?: number;
  aiSummary?: string;
}

export interface IConceptVersionList {
  versions: IConceptVersion[];
  versionCount: number;
}

/**
 * Schema for individual concept version
 * Note: This interface depends on ConceptVersionSchema which should be defined elsewhere
 */

import type { IPageQueryOptions, IPageResponse } from '../osiris';

export type ConceptStatus =
  | 'new'
  | 'ideating'
  | 'inReview'
  | 'prototyping'
  | 'proofOfConcept'
  | 'minimumViableProduct'
  | 'commercialized'
  | 'archived';

export type ConceptCategory = 'active' | 'draft' | 'archive';

export type DraftConceptStatus = Exclude<
  ConceptStatus,
  | 'prototyping'
  | 'proofOfConcept'
  | 'minimumViableProduct'
  | 'commercialized'
  | 'archived'
>;

export type ArchivedConceptStatus = Exclude<
  ConceptStatus,
  | 'new'
  | 'ideating'
  | 'inReview'
  | 'prototyping'
  | 'proofOfConcept'
  | 'minimumViableProduct'
  | 'commercialized'
>;

export type ActiveConceptStatus = Exclude<
  ConceptStatus,
  ArchivedConceptStatus | DraftConceptStatus
>;

export type ConceptReportStatus =
  | 'notStarted'
  | 'complete'
  | 'pending'
  | 'error'
  | 'draft';

export interface IBaseConceptEntity {
  uuid: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface IGeneratedConceptBase {
  // API provided properties
  uuid: string;
  title: string;
  summary: string;
  overview: string;
  valueProposition: string;
}

export interface IGeneratedConcept extends IGeneratedConceptBase {
  // Frontend properties
  clarifyingQuestions?: IClarifyingQuestion[];
  isGenerating?: boolean;
  generationOrder?: number;
}

/**
 * Represents the status of a specific section within a concept report.
 */
export interface IConceptReportStatusSection {
  status: ConceptReportStatus; // Reusing the existing ConceptReportStatus type seems appropriate here
  dateStarted: string;
  dateCompleted: string;
}

/**
 * Represents the status of the report generation for each section.
 * The keys are the names of the sections.
 */
export type ConceptReportStatusBySection = {
  [sectionName: string]: IConceptReportStatusSection;
};

export interface IConcept extends IBaseConceptEntity {
  uuid: string;
  title: string;
  summary: string;
  overview: string;
  valueProposition: string;
  problemStatement?: string;
  identifier: string;
  reportStatusAggregate: ConceptReportStatus;
  reportStatusBySection: ConceptReportStatusBySection; // Use the new type here
  dateReportStarted: string;
  dateReportCompleted: string;
  status: ConceptStatus;
  category: ConceptCategory;
  createdBy: IUser; // Assuming IUser is defined elsewhere
  hasSeed: boolean;
  seedUuid: string;
  isHistoricalVersion: boolean;
  conceptVersionId: number;
}

export interface IConceptOverview extends IBaseConceptEntity {
  text: string;
  valueProposition: string;
  problemStatement?: string;

  // TODO: Remove and use API instead.
  persona?: ICustomerProfile;
  financialProjection?: IFinancialProjection;
}

export interface ICustomerJob {
  description: string;
  order: number;
  icon?: IconVariant
}

export interface ICustomerPain {
  description: string;
  order: number;
  icon?: IconVariant;
}

export interface ICustomerProfile extends IBaseConceptEntity {
  name: string;
  description: string;
  nickname: string;
  geoLocation: string;
  familySize: number;
  ageUpper: number;
  ageLower: number;
  ageRange: string;
  incomeUpper: number;
  incomeLower: number;
  incomeRange: string;
  jobs: ICustomerJob[];
  pains: ICustomerPain[];
  avatarUrl?: string;
}

export interface ICustomerProfileCreate {
  name: string;
  description: string;
  nickname: string;
  geoLocation: string;
  familySize: number;
  ageUpper: number;
  ageLower: number;
  incomeUpper: number;
  incomeLower: number;
  jobs: string[];
  pains: string[];
}

export type SortableConceptProperties =
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'title';
export type ConceptSort =
  | SortableConceptProperties
  | `-${SortableConceptProperties}`;

export interface IConceptQueryOptions extends IPageQueryOptions {
  search?: string;
  user?: string;
  status?: string;
  category?: string;
  createdBy?: string;
  sort?: ConceptSort;
}

export interface IConceptPage extends IPageResponse<IConcept> {
  statusCounts: { [key in ConceptStatus]: number };
}

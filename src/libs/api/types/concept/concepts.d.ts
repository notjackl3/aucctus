import type { IPageQueryOptions, IPageResponse } from '../osiris';
import type { ISource } from './support';

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
  problemStatement: string;
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

export type FeatureVersion = `v${number}`;

export type FeatureName = 'assumptions' | 'financialProjection';

export type IFeatureVersions = {
  [K in FeatureName]?: FeatureVersion;
};

export interface IConcept extends IBaseConceptEntity {
  uuid: string;
  title: string;
  summary: string;
  overview: string;
  valueProposition: string;
  problemStatement: string;
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
  hasSeenConceptChange: boolean;
  lastModifiedBy?: {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    modifiedAt: string;
  };
  isHistoricalVersion?: boolean;
  featureVersions?: IFeatureVersions;
}

export interface IConceptOverview extends IBaseConceptEntity {
  text: string;
  valueProposition: string;
  problemStatement: string;

  // TODO: Remove and use API instead.
  persona?: ICustomerProfile;
  financialProjection?: IFinancialProjection;
}

export interface ICustomerListItem {
  uuid: string;
  description: string;
  order: number;
  icon?: IconVariant;
}

export interface ICustomerJob extends ICustomerListItem {}

export interface ICustomerPain extends ICustomerListItem {}

/**
 * Represents a customer alternative product or solution.
 */
export interface ICustomerAlternative {
  name: string;
  usage?: string;
  pros: string[];
  cons: string[];
  price: string;
  uuid?: string;
}

export interface ICustomerProfileRealWorldSignalsResponse
  extends IBaseConceptEntity {
  status: 'Not Started' | 'Pending' | 'Error' | 'Complete';
  summary?: string;
  signals: ICustomerProfileRealWorldSignal[];
}

export type SignalStanceType = 'In Favour' | 'Against' | 'Neutral';
export type SignalSourceCategoryType =
  | 'First-Party Research'
  | 'Online Article'
  | 'Government Report'
  | 'Academic Study'
  | 'Social Media'
  | 'User Forum'
  | 'Other';

export interface ICustomerProfileRealWorldSignal extends IBaseConceptEntity {
  uuid: string;
  description: string;
  sourceCategory: SignalSourceCategoryType;
  stance: SignalStanceType;
  sources?: ISource[];
}

export interface ICreateRealWorldSignal {
  description: string;
  sourceCategory: SignalSourceCategoryType;
  stance: SignalStanceType;
  sources: Partial<ISource>[];
}

export interface ICustomerProfile extends IBaseConceptEntity {
  name: string;
  description: string;
  segment: string;
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
  journey: IUserJourneyStep[];
  avatarUrl?: string;
  jobsToBeDoneInsight?: string;
  painsInsight?: string;
  alternativesInsight?: string;
  journeyInsight?: string;
  customerInsight?: string;
  isPrimary?: boolean;

  conversations?: ICustomerProfileConversation[]; // Returned from additional API call
}

export interface ICustomerProfileCreate {
  name: string;
  description: string;
  segment: string;
  geoLocation: string;
  familySize: number;
  ageUpper: number;
  ageLower: number;
  incomeUpper: number;
  incomeLower: number;
  jobs: string[];
  pains: string[];
  journey: IUserJourneyStep[];
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

// For EditableList usage, allow uuid as optional (for new/unsaved items)
export interface ICustomerListItemWithUuid extends ICustomerListItem {
  uuid?: string;
}

/**
 * Represents a step in the user journey.
 */
export interface IUserJourneyStep {
  uuid: string;
  title: string;
  description: string;
  order: number;
  relationType?:
    | 'job'
    | 'pain'
    | 'Journey Step'
    | 'JTBD'
    | 'Pain'
    | 'Moment of Intervention';
  icon?: IconVariant;
}

export interface IUserJourneyStepCreate {
  title: string;
  description: string;
  order: number;
  relationType?:
    | 'job'
    | 'pain'
    | 'Journey Step'
    | 'JTBD'
    | 'Pain'
    | 'Moment of Intervention';
}

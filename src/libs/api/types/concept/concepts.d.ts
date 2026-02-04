import { ConceptIncubationQuestionnaireType } from '../incubation/questionnaire';
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

export type ConceptShareFormat = 'pdf' | 'video' | 'ppt';

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

/**
 * Section keys for email notification scheduling
 */
export type NotificationSectionKey = 'synthetic_execution';

export interface IBaseConceptEntity {
  uuid: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGeneratedConceptDifferentiator {
  order: number;
  description: string;
}

export interface IGeneratedConceptRightToWin {
  order: number;
  description: string;
}

interface IGeneratedConceptBase {
  // API provided properties
  uuid: string;
  title: string;
  summary: string;
  overview: string;
  valueProposition: string;
  problemStatement: string;
  differentiators: IGeneratedConceptDifferentiator[];
  rightsToWin: IGeneratedConceptRightToWin[];
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

export type FeatureName =
  | 'assumptions'
  | 'financialProjection'
  | 'marketScan'
  | 'conceptOverview'
  | 'ecosystem';

export type IFeatureVersions = {
  [K in FeatureName]?: FeatureVersion;
};

export interface IConceptDifferentiator
  extends IGeneratedConceptDifferentiator {
  uuid: string;
}

export interface IConceptRightToWin extends IGeneratedConceptRightToWin {
  uuid: string;
}

export interface IConceptOverview extends IBaseConceptEntity {
  uuid: string;
  overview: string; // matches actual API response
  valueProposition: string;
  problemStatement: string;
  whatIsThis: string; // concise product definition
  shouldWeDoThis: string; // executive recommendation
  heroImagePrompt: string; // detailed prompt for image generation
  conceptImageUrl: string;
  customImageUrl?: string; // S3 URL for user-uploaded custom image
  useCustomImage: boolean; // whether to display custom image instead of AI-generated
  conceptVideoUrl?: string; // S3 URL for AI generated video
  videoStatus?: 'generating' | 'complete' | 'error'; // Video generation status
  videoGenerationStage?: string; // Current stage of video generation (persisted)
  videoGenerationProgress?: number; // Current progress percentage (persisted)
  overviewVersion: string;
  differentiators: IConceptDifferentiator[];
  rightsToWin: IConceptRightToWin[]; // matches actual API response
  // Executive summary fields for rotating cards
  marketSizeSummary?: string;
  trendsDriversSummary?: string;
  businessModelSummary?: string;
  ecosystemSummary?: string;
  customerProfilesSummary?: string;
  keyAssumptionsSummary?: string;
}
export interface IConcept extends IBaseConceptEntity {
  uuid: string;
  title: string;
  summary: string;
  overview: string;
  valueProposition: string;
  problemStatement: string;
  differentiators: IConceptDifferentiator[];
  rightsToWin: IConceptRightToWin[];
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
  seedType: ConceptIncubationQuestionnaireType;
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
  financialProjectionType: 'cost_savings' | 'generate_revenue';

  // Progress tracking fields for real-time WebSocket updates
  progressPercentage?: number;
  completedSections?: string[];
  totalSections?: number;
  conceptImageUrl?: string;

  // Custom properties from dynamic property definitions
  customProperties?: Record<string, any>;
}

export interface IConceptMagicShareLatest {
  uuid: string;
  status: 'generating' | 'completed' | 'failed';
  fileType?: 'video' | 'pdf' | 'ppt';
  fileUrl?: string;
  lastAccessedAt?: string;
  createdAt: string;
  // Progress tracking fields (synced with WebSocket updates)
  stage?:
    | 'started'
    | 'gathering_data'
    | 'generating_html'
    | 'generating_pdf'
    | 'generating_video'
    | 'generating_slides'
    | 'uploading'
    | 'completed';
  message?: string;
  progress?: number;
  // Error tracking fields
  errorCode?: string;
  errorDetails?: string;
}

export interface IConceptOverview extends IBaseConceptEntity {
  text: string;
  valueProposition: string;
  problemStatement: string;
  conceptVideoUrl?: string; // S3 URL for AI generated video
  videoStatus?: 'generating' | 'complete' | 'error'; // Video generation status
  videoGenerationStage?: string; // Current stage of video generation (persisted)
  videoGenerationProgress?: number; // Current progress percentage (persisted)

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

// Common response type for generation endpoints (matches Django MessageSchema)
export interface IGenerationResponse {
  uuid: string;
  detail: string;
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
  | 'created_at'
  | 'updated_at'
  | 'created_by__first_name'
  | 'created_by__last_name'
  | 'updated_by__first_name'
  | 'updated_by__last_name'
  | 'status'
  | 'title'
  | 'priority__overall_priority_score';

// Single sort field (standard field or property)
export type ConceptSortField =
  | SortableConceptProperties
  | `-${SortableConceptProperties}`
  | `property:${string}`
  | `-property:${string}`;

// Legacy: Single sort (backward compatible)
export type ConceptSort = ConceptSortField;

// New: Multiple sorts as comma-separated string
// Examples:
// - "status,-createdAt" (status asc, then createdAt desc)
// - "property:priority,-updatedAt" (priority asc, then updatedAt desc)
// - "-property:priority,property:team_size,status" (priority desc, team_size asc, status asc)
export type ConceptSortString = string;

export interface IConceptQueryOptions extends IPageQueryOptions {
  search?: string;
  user?: string;
  status?: string;
  category?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  sort?: ConceptSortString; // Now accepts comma-separated sort fields
  properties?: string; // JSON-encoded array of property filters with AND logic
  pageSize?: number; // Number of results per page (default: 20)
  uuids?: string; // Comma-separated UUIDs to filter by (e.g., "uuid1,uuid2,uuid3")
  // Legacy single-property filter (deprecated, use properties instead)
  property_key?: string;
  property_value?: any;
  property_operator?: string;
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

/**
 * Executive summaries for each major section of the concept report.
 * Each summary is 1-2 sentences (~35 words) identifying the primary opportunity driver
 * and primary challenge for that section, contextualized by the concept and company.
 */
export interface IExecutiveSummaries extends IBaseConceptEntity {
  // Market Scan summaries
  marketScanTrendsDrivers?: string; // market_scan_trends_drivers from Django
  marketScanEcosystem?: string; // market_scan_ecosystem from Django

  // Financial Projections summaries
  financialBusinessModel?: string; // financial_business_model from Django
  financialMarketSizeRevenue?: string; // financial_market_size_revenue from Django
  financialMarketSizeCostSavings?: string; // financial_market_size_cost_savings from Django

  // Other sections
  customerProfiles?: string; // customer_profiles from Django
  keyAssumptions?: string; // key_assumptions from Django
}

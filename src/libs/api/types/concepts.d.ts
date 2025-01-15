import { IPageResponse } from '.';

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
  | 'error';

export interface IBaseConceptEntity {
  uuid: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGeneratedConcept {
  uuid: string;
  title: string;
  description: string;
}

// Used When creating a new concept
export interface IConceptCreate extends IGeneratedConcept {
  status?: ConceptStatus;
  createdBy?: string;
}

export interface IConcept extends IBaseConceptEntity, IGeneratedConcept {
  isGenerated: boolean; // Currently not used will likely drop
  identifier: string;
  reportStatus: ConceptReportStatus;
  status: ConceptStatus;
  category: ConceptCategory;
  createdBy: IUser;

  marketScanVersion: 'v1' | 'v2';
}

export interface IConceptOverview extends IBaseConceptEntity {
  valueProposition: string;
  problemStatement?: string;
  industries: string[];
  trendsAndDrivers?: string[];
  persona?: ICustomerProfile;
  financialProjection?: IFinancialProjection;
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
  jobs: string[];
  pains: string[];
  quotes: string[];
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
  quotes: string[];
}

export type MarketMetricType = 'TAM' | 'SAM' | 'SOM';

interface BaseFinancialProjectionItem extends IBaseConceptEntity {
  rationale: string;
  sources: ISource[];
}

export interface IBusinessModel extends BaseFinancialProjectionItem {
  name: string;
  description: string;
}
export interface IFinancialProjectionPricing
  extends BaseFinancialProjectionItem {
  price: number;
  billing: string;
  averageRevenuePerCustomer: number;
  purchasingFrequency: number;
}

export interface IFinancialMarketSizeItem extends BaseFinancialProjectionItem {
  value: number;
  assumptions: string[];
}

export interface IFinancialProjection extends IBaseConceptEntity {
  overview: string;
  businessModel: IBusinessModel;
  pricing: IFinancialProjectionPricing;
  totalUsers: IFinancialMarketSizeItem;
  serviceableAddressablePercent: IFinancialMarketSizeItem;
  serviceableObtainablePercent: IFinancialMarketSizeItem;

  tam: number;
  sam: number;
  som: number;
}

export interface IConceptPage extends IPageResponse<IConcept> {
  statusCounts: { [key in ConceptStatus]: number };
}

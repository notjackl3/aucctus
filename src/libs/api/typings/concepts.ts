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
  'prototyping' | 'proofOfConcept' | 'minimumViableProduct' | 'commercialized' | 'archived'
>;
export type ArchivedConceptStatus = Exclude<
  ConceptStatus,
  'new' | 'ideating' | 'inReview' | 'prototyping' | 'proofOfConcept' | 'minimumViableProduct' | 'commercialized'
>;
export type ActiveConceptStatus = Exclude<ConceptStatus, ArchivedConceptStatus | DraftConceptStatus>;

export type ConceptReportStatus = 'notStarted' | 'complete' | 'pending' | 'error';

export interface IConcept {
  uuid: string;
  title: string;
  isGenerated: boolean;
  reportStatus: ConceptReportStatus;
  status: ConceptStatus;
  category: ConceptCategory;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface IConceptCreate {
  title: string;
  description: string;
  status?: ConceptStatus;
  createdBy?: string;
}

export interface IConceptGenerate {
  goal: string;
}

export interface IConceptGenerateResponse {
  concepts: Partial<IConcept>[];
}

export interface IConceptOverview {
  uuid: string;
  valueProposition: string;
  industries: string[];
  trendsAndDrivers?: string[];
  persona?: ICustomerProfile;
  financialProjection?: IFinancialProjection;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomerProfile {
  uuid: string;
  name: string;
  description: string;
  nickname: string;
  overview: string;
  geoLocation: string;
  familySize: number;
  ageUpper: number;
  ageLower: number;
  ageRange: string;
  incomeUpper: number;
  incomeLower: number;
  incomeRange: string;
  jobsToBeDone: [string];
  pains: [string];
  quotes: [string];
  createdAt: string;
  updatedAt: string;
}

export type MarketMetricType = 'TAM' | 'SAM' | 'SOM';

export interface MarketSizeMetrics {
  dataPoint: string;
  keyHypothesis: string;
  metricType: MarketMetricType;
  reason: string;
  value: number;
}

export interface IFinancialProjection {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  overview: string;
  marketSizeMetrics: MarketSizeMetrics[];
}

export enum AssumptionType {
  adaptability = 'adaptability',
  desirability = 'desirability',
  feasibility = 'feasibility',
  viability = 'viability',
}
export interface IAssumption {
  uuid: string;
  name: string;
  hypothesis: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Rationale for the risk and impact level
   *
   */
  rationale: string;
  potentialImpact: string;
  expectedResult: string;
  methodOfTesting: string;
  variables: [string];
  assumptionsType: AssumptionType;

  /**
   * The risk level of the assumption
   * A number between -10 and 10
   */
  riskLevel: number;
  riskRationale: string;
  /**
   * The impact level of the assumption
   * A number between -10 and 10
   */
  impactLevel: number;
  impactRationale: string;

  /**
   * The difficulty level of the assumption
   * A number between -10 and 10
   */
  difficultyLevel: number;
  difficultyRationale: string;

  validated: boolean;
  riskCategory: 'high' | 'medium' | 'low';
  impactCategory: 'high' | 'medium' | 'low';
}

export interface IEcosystem {
  uuid: string;
  name: string;
  description: string;
  source: string;
}

export interface IStartupEcosystem extends IEcosystem {
  ecosystemType: 'startup';
}

export interface IIncumbentsEcosystem extends IEcosystem {
  ecosystemType: 'incumbents';
}

export interface IInvestorsEcosystem extends IEcosystem {
  ecosystemType: 'investors';
}

export interface ITrendsAndDrivers {
  uuid: string;
  name: string;
  description: string;
  source: string;
  // Currently not implemented but will be used in the future
  image: undefined;

  createdAt: string;
  updatedAt: string;
}

export interface IMarketScan {
  uuid: string;
  name: string;
  startups: IStartupEcosystem[];
  incumbents: IIncumbentsEcosystem[];
  investors: IInvestorsEcosystem[];
  trendsAndDrivers: ITrendsAndDrivers[];
  trendsAndDriversDescription: string;
  ecosystemDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface IConceptPage extends IPageResponse<IConcept> {
  statusCounts: { [key in ConceptStatus]: number };
}

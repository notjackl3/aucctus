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

export interface IBaseConceptEntity {
  uuid: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IGeneratedConcept {
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
  seed?: Unknown;
  reportStatus: ConceptReportStatus;
  status: ConceptStatus;
  category: ConceptCategory;
  createdBy: string;
}
type ConceptSeedType = 'EXPAND_AN_EXISTING_IDEA' | 'IDENTIFY_NEW_OPPORTUNITIES' | 'UNKNOWN';
type ExpandAnExistingIdeaQuestionKeys = 'DESCRIBE' | 'PROBLEM' | 'CUSTOMER' | 'SUCCESS';
type IdentifyNewOpportunitiesQuestionKeys = 'TARGET' | 'PROBLEM' | 'INTEREST' | 'SUCCESS';
type IgniteConceptQuestionKeys = ExpandAnExistingIdeaQuestionKeys | IdentifyNewOpportunitiesQuestionKeys;

export interface IConceptSeedAttribute<T = IgniteConceptQuestionKeys> {
  question: T;
  answer: string;
}

interface IConceptSeedBase {
  attributes: IConceptSeedAttribute[];
  type: ConceptSeedType;
  createdBy: string;
}

export interface IConceptSeed extends IConceptSeedBase, Omit<IBaseConceptEntity, 'version'> {}

export interface IConceptOverview extends IBaseConceptEntity {
  valueProposition: string;
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

export interface IMarketSizeMetric extends IBaseConceptEntity {
  dataPoint: string;
  keyHypothesis: string;
  metricType: MarketMetricType;
  reason: string;
  value: number;
}

export interface IFinancialProjection extends IBaseConceptEntity {
  overview: string;
  marketSizeMetrics: IMarketSizeMetric[];
}

type AssumptionType = 'adaptability' | 'desirability' | 'feasibility' | 'viability';
export interface IAssumption extends IBaseConceptEntity {
  name: string;
  hypothesis: string;

  /**
   * Rationale for the risk and impact level
   *
   */
  rationale: string;
  potentialImpact: string;
  expectedResult: string;
  methodOfTesting: string;
  variables: string[];
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

export interface IAssumptionCreate {
  name: string;
  hypothesis: string;
  riskLevel: number;
  difficultyLevel: number;
  impactLevel: number;
  assumptionsType: AssumptionType;
}

export interface IEcosystem extends IBaseConceptEntity {
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

type Ecosystem = IStartupEcosystem | IIncumbentsEcosystem | IInvestorsEcosystem;
type EcosystemType = Ecosystem['ecosystemType'];
export interface ITrendsAndDrivers extends IBaseConceptEntity {
  name: string;
  description: string;
  source: string;
  // Currently not implemented but will be used in the future
  image: undefined;
}

export interface IMarketScanElementCreate {
  name: string;
  description: string;
  source: string;
}

export interface IEcosystemCreate extends IMarketScanElementCreate {
  ecosystemType: EcosystemType;
}

export interface IMarketScan extends IBaseConceptEntity {
  name: string;
  startups: IStartupEcosystem[];
  incumbents: IIncumbentsEcosystem[];
  investors: IInvestorsEcosystem[];
  trendsAndDrivers: ITrendsAndDrivers[];
  trendsAndDriversDescription: string;
  ecosystemDescription: string;
}

export interface IConceptPage extends IPageResponse<IConcept> {
  statusCounts: { [key in ConceptStatus]: number };
}

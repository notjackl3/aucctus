export enum ConceptStatus {
  new = 'new',
  ideating = 'ideating',
  inReview = 'in_review',
  prototyping = 'prototyping',
  proofOfConcept = 'proof_of_concept',
  minimumViableProduct = 'minimum_viable_product',
  commercialized = 'commercialized',
  archived = 'archived',
}
export enum ConceptCategory {
  active = 'active',
  draft = 'draft',
  archive = 'archive',
}
export interface IConcept {
  uuid: string;
  title: string;
  isGenerated: boolean;
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
  industries: [string];
  trendsAndDrivers: [string];
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

export interface IFinancialProjection {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  overview: string;
  // TODO: Add the rest of the fields
  marketSizeMetrics: any;
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
  description: string;
  createdAt: string;
  updatedAt: string;
  assumptionType: AssumptionType;
  /**
   * The risk level of the assumption
   * A number between -10 and 10
   */
  riskLevel: string;
  /**
   * The risk level of the assumption
   * A number between -10 and 10
   */
  impactLevel: string;

  /**
   * Reason for the risk and impact level
   */
  reason: string;
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

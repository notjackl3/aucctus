import type { IBaseConceptEntity } from './concepts';
import type { ISupport } from './support';

export type EngagementAction =
  | 'partnership'
  | 'investment'
  | 'acquisition'
  | 'customer'
  | 'supplier';
export interface IPotentialEngagement {
  description: string;
  action: EngagementAction;
}

export interface IContact {
  name: string;
  title: string;
  email?: string;
  linkedin?: string;
}

export interface IKeyFact {
  text: string;
  evidence: FieldEvidence;
}

export interface INewsAndActivities {
  text: string;
  evidence: FieldEvidence;
}

export interface IBaseMarketScanCompany extends IBaseConceptEntity {
  name: string;
  domain?: string;
  overview?: string;
  overviewEvidence?: FieldEvidence;
  founded?: string;
  foundedEvidence?: FieldEvidence;
  headquarters?: string;
  headquartersEvidence?: FieldEvidence;
  relevance?: string;
  newsAndActivities?: INewsAndActivities[];

  status: 'isPending' | 'completed';
}

export interface IStartup extends IBaseMarketScanCompany {
  uuid: string;

  relevance?: string;
  predictions?: string;

  valueProposition: string;
  valuePropositionEvidence: FieldEvidence;

  competitiveAdvantage: string;
  competitiveAdvantageEvidence: FieldEvidence;

  keyContacts: IContact[];
  keyFacts: IKeyFact[];

  potentialEngagements?: IPotentialEngagement[];
}

export interface FieldEvidence {
  insight: string;
  // The source of the evidence
  sources: ISource[];
}

export interface IIncumbent extends IBaseMarketScanCompany {
  hasCompetitiveProduct: boolean;
}

export type TrendChangeType = 'increasing' | 'decreasing' | 'stagnating';

export interface ITrendsAndDrivers extends IBaseConceptEntity {
  uuid: string;
  name: string;
  description: string;
  trendChange: TrendChangeType; // Use the literal type
  imagePath: string;
  support: ISupport;
  createdAt: string;
  updatedAt: string;
}

export interface IMarketScan extends IBaseConceptEntity {
  name: string;

  ecosystemDescription: string;
  startups: IStartup[];
  incumbents: IIncumbents[];

  trendsAndDriversDescription: string;
  trendsAndDrivers: ITrendsAndDrivers[];
}

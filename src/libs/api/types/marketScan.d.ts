import { IBaseConceptEntity } from '.';
interface IEngagementTactic {
  name: string;
  description: string;
  when: string;
}

interface IContact {
  name: string;
  title: string;
  email?: string;
  linkedin?: string;
}

interface IKeyFact {
  fact: string;
  source: string;
}

export interface IBaseMarketScanCompany extends IBaseConceptEntity {
  name: string;
  domain: string;
  overview: string;
  overviewEvidence: FieldEvidence;
  founded: string;
  foundedEvidence: FieldEvidence;
  headquarters: string;
  headquartersEvidence: FieldEvidence;
}

export interface IStartup extends IBaseMarketScanCompany {
  uuid: string;

  valueProposition: string;
  valuePropositionEvidence: FieldEvidence;

  competitiveAdvantage: string;
  competitiveAdvantageEvidence: FieldEvidence;

  keyContacts: IContact[];
}

export interface FieldEvidence {
  insight: string;
  // The source of the evidence
  sources: ISource[];
}

export interface IIncumbent extends IBaseMarketScanCompany {
  hasCompetitiveProduct: boolean;
  recentActivity?: list[Any];
  recommendedAction?: string;
}

type TrendChangeType = 'increasing' | 'decreasing' | 'stagnating';

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

export interface IInvestor extends IBaseConceptEntity {}

export interface IMarketScan extends IBaseConceptEntity {
  name: string;

  ecosystemDescription: string;
  startups: IStartup[];
  incumbents: IIncumbents[];
  investors: IInvestors[];

  trendsAndDriversDescription: string;
  trendsAndDrivers: ITrendsAndDrivers[];
}

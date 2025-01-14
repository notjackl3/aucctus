export interface IGeneralInfo {
  overview: string;
  headquarters: string;
  yearEstablished: number;
}

export interface IRecentActivity {
  activity: string;
  source: string;
}

interface IEngagementTactic {
  name: string;
  description: string;
  when: string;
}

interface IContact {
  name: string;
  position: string;
  source: 'general' | 'linkedin';
}

interface IKeyFact {
  fact: string;
  source: string;
}

export interface IStartup extends IBaseConceptEntity {
  uuid: string;
  name: string;
  overview: string;
  domain: string;

  overviewEvidence: FieldEvidence;

  headquarters: string;
  headquartersEvidence: FieldEvidence;

  founded: string;
  foundedEvidence: FieldEvidence;

  valueProposition: string;
  valuePropositionEvidence: FieldEvidence;

  competitiveAdvantage: string;
  competitiveAdvantageEvidence: FieldEvidence;
}

export interface FieldEvidence {
  insight: string;
  // The source of the evidence
  sources: ISource[];
}

export interface IIncumbent extends IBaseConceptEntity {
  uuid: string;
  source: string;
  ecosystemType: string;
  version: number;
  uuid: string;
  name: string;
  description: string;
  general: IGeneralInfo;
  recentActivity: IRecentActivity[];
  recommendedAction: string;
  hasCompetitiveProduct: boolean;
  support: ISupport[];
  createdAt: string;
  updatedAt: string;
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

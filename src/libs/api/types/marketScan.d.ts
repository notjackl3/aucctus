import { IBaseConceptEntity } from '.';
import { ISupport } from './support';

type EngagementAction =
  | 'partnership'
  | 'investment'
  | 'acquisition'
  | 'customer'
  | 'supplier';
interface IPotentialEngagement {
  description: string;
  action: EngagementAction;
}

interface IContact {
  name: string;
  title: string;
  email?: string;
  linkedin?: string;
}

interface IKeyFact {
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

export interface IInvestor extends IBaseConceptEntity {
  uuid: string;
  name: string;
  domain: string;
  investedAmount: number;
  companies: string[];
  investmentDate: string;
  createdAt: string;
  updatedAt: string;
  support: ISupport;
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

export interface IMarketScan extends IBaseConceptEntity {
  name: string;

  ecosystemDescription: string;
  startups: IStartup[];
  incumbents: IIncumbents[];
  investors: IInvestor[];

  trendsAndDriversDescription: string;
  trendsAndDrivers: ITrendsAndDrivers[];
}

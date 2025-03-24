import type { IBaseConceptEntity } from './concepts';
import type { ISupport } from './support';

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

interface INewsAndActivities {
  text: string;
  evidence: FieldEvidence;
}

interface IBaseMarketScanCompany extends IBaseConceptEntity {
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

interface IStartup extends IBaseMarketScanCompany {
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

interface FieldEvidence {
  insight: string;
  // The source of the evidence
  sources: ISource[];
}

interface IIncumbent extends IBaseMarketScanCompany {
  hasCompetitiveProduct: boolean;
}

type TrendChangeType = 'increasing' | 'decreasing' | 'stagnating';

interface ITrendsAndDrivers extends IBaseConceptEntity {
  uuid: string;
  name: string;
  description: string;
  trendChange: TrendChangeType; // Use the literal type
  imagePath: string;
  support: ISupport;
  createdAt: string;
  updatedAt: string;
}

interface IMarketScan extends IBaseConceptEntity {
  name: string;

  ecosystemDescription: string;
  startups: IStartup[];
  incumbents: IIncumbents[];

  trendsAndDriversDescription: string;
  trendsAndDrivers: ITrendsAndDrivers[];
}

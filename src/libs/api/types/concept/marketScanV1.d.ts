import type { IBaseConceptEntity } from './concepts';
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

export type Ecosystem =
  | IStartupEcosystem
  | IIncumbentsEcosystem
  | IInvestorsEcosystem;
export type EcosystemType = Ecosystem['ecosystemType'];

export interface ITrendsAndDriversV1 extends IBaseConceptEntity {
  uuid: string;
  name: string;
  description: string;
  source: string;
  sources: [string];
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

export interface IMarketScanV1 extends IBaseConceptEntity {
  name: string;
  startups: IStartupEcosystem[];
  incumbents: IIncumbentsEcosystem[];
  investors: IInvestorsEcosystem[];
  trendsAndDrivers: ITrendsAndDriversV1[];
  trendsAndDriversDescription: string;
  ecosystemDescription: string;
}

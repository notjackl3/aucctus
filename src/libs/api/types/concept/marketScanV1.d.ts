import type { IBaseConceptEntity } from './concepts';
interface IEcosystem extends IBaseConceptEntity {
  name: string;
  description: string;
  source: string;
}

interface IStartupEcosystem extends IEcosystem {
  ecosystemType: 'startup';
}

interface IIncumbentsEcosystem extends IEcosystem {
  ecosystemType: 'incumbents';
}

interface IInvestorsEcosystem extends IEcosystem {
  ecosystemType: 'investors';
}

type Ecosystem = IStartupEcosystem | IIncumbentsEcosystem | IInvestorsEcosystem;
type EcosystemType = Ecosystem['ecosystemType'];

interface ITrendsAndDriversV1 extends IBaseConceptEntity {
  uuid: string;
  name: string;
  description: string;
  source: string;
  sources: [string];
  image: undefined;
}

interface IMarketScanElementCreate {
  name: string;
  description: string;
  source: string;
}

interface IEcosystemCreate extends IMarketScanElementCreate {
  ecosystemType: EcosystemType;
}

interface IMarketScanV1 extends IBaseConceptEntity {
  name: string;
  startups: IStartupEcosystem[];
  incumbents: IIncumbentsEcosystem[];
  investors: IInvestorsEcosystem[];
  trendsAndDrivers: ITrendsAndDriversV1[];
  trendsAndDriversDescription: string;
  ecosystemDescription: string;
}

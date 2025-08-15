import { HeadersDefaults } from 'axios';
import analytics from '../telemetry';
import { AccountApi } from './account';
import { ArticleApi } from './article';
import { AssumptionsApi } from './assumptions';

import { IApiServiceConfig } from './base/apiService';
import { ISocketConfig, SocketService } from './base/socketService';
import { ConceptApi } from './concepts';
import { SocketEndpoints } from './endpoints';
import { FinancialProjectionApi } from './financialProjection';
import { IncubateConceptApi } from './incubateConcepts';
import { MarketScanApi } from './marketScan';
import { SeedApi } from './seed';
import { TestingApi } from './testing';
import { TrendsAndDriversV3Api } from './trendsAndDrivers';

export interface IApiConfig {
  /* End Points */
  baseUrl: string;
  baseSocketUrl: string;
  /* Settings */
  defaultHeaders?: HeadersDefaults;
  timeoutSeconds: number;
  debug: boolean;
  appId: string;
}

export class Api {
  private _config: IApiConfig;
  private _clerkTokenGetter?: () => Promise<string | null>;

  account!: AccountApi;
  concept!: ConceptApi;
  seed!: SeedApi;
  assumption!: AssumptionsApi;
  marketScan!: MarketScanApi;
  conceptIncubate!: IncubateConceptApi;
  aucctusSocket!: SocketService;
  article!: ArticleApi;
  testing!: TestingApi;
  financialProjection!: FinancialProjectionApi;
  trendsAndDriversV3!: TrendsAndDriversV3Api;

  constructor(apiConfig: IApiConfig) {
    this._config = apiConfig;

    // Configure socket settings.
    const socketConfig: ISocketConfig = {
      baseUrl: `${this._config.baseSocketUrl}${SocketEndpoints.aucctus}`,
      debug: this._config.debug,
      autoConnect: true,
      maxRetries: 5,
    };
    this.aucctusSocket = new SocketService(this, socketConfig);

    const apiClasses: { key: keyof Api; class: any }[] = [
      { key: 'account', class: AccountApi },
      { key: 'concept', class: ConceptApi },
      { key: 'assumption', class: AssumptionsApi },
      { key: 'marketScan', class: MarketScanApi },
      { key: 'conceptIncubate', class: IncubateConceptApi },
      { key: 'article', class: ArticleApi },
      { key: 'seed', class: SeedApi },
      { key: 'testing', class: TestingApi },
      { key: 'financialProjection', class: FinancialProjectionApi },
      { key: 'trendsAndDriversV3', class: TrendsAndDriversV3Api },
    ];

    apiClasses.forEach(({ key, class: ApiClass }) => {
      this[key] = new ApiClass(
        this,
        this.buildConfig({
          baseURL: this._config.baseUrl,
          withCredentials: true,
        }),
      );
    });
  }

  // Method to get Clerk token for API requests
  async getToken(): Promise<string | undefined> {
    if (this._clerkTokenGetter) {
      try {
        const clerkToken = await this._clerkTokenGetter();
        if (clerkToken) {
          return clerkToken;
        }
      } catch (error) {
        analytics.error('Failed to get Clerk token', error);
      }
    }
    return undefined;
  }

  // Method to set Clerk token getter
  setClerkTokenGetter(getter: () => Promise<string | null>) {
    this._clerkTokenGetter = getter;
  }

  buildConfig(config: IApiServiceConfig): IApiServiceConfig {
    if (config.headers) {
      Object.assign(config.headers, this._config.defaultHeaders || {});
    }
    return Object.assign(config, {
      timeoutSeconds: this._config.timeoutSeconds,
      debug: this._config.debug,
    });
  }
}

export default Api;

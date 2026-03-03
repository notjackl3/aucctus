import { HeadersDefaults } from 'axios';
import analytics from '../telemetry';
import { AccountApi } from './account';
import { AccountBrandingApi } from './accountBranding';
import { AdminApi } from './admin';
import { ArticleApi } from './article';
import { AssumptionsApi } from './assumptions';

import { IApiServiceConfig } from './base/apiService';
import { ISocketConfig, SocketService } from './base/socketService';
import { CompetitorAssessmentApi } from './competitorAssessment';
import { ConceptApi } from './concepts';
import { DynamicComponentApi } from './dynamicComponent';
import { SocketEndpoints } from './endpoints';
import { FinancialProjectionApi } from './financialProjection';
import { IdeaPlaygroundApi } from './ideaPlayground';
import { IdeaSubmissionsApi } from './ideaSubmissions';
import { IncubateConceptApi } from './incubateConcepts';
import { MarketScanApi } from './marketScan';
import { NucleusApi } from './nucleus';
import { OverseerApi } from './overseer';
import { PersonaApi } from './persona';
import { PocPlanApi } from './pocPlan';
import { PortfolioApi } from './portfolio';
import { PortfolioInsightsApi } from './portfolioInsights';
import { PropertyApi } from './properties';
import { SeedApi } from './seed';
import { TestingApi } from './testing';
import { TrendsAndDriversV3Api } from './trendsAndDrivers';
import { WatchtowerApi } from './watchtower';

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
  admin!: AdminApi;
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
  nucleus!: NucleusApi;
  ideaPlayground!: IdeaPlaygroundApi;
  ideaSubmissions!: IdeaSubmissionsApi;
  pocPlan!: PocPlanApi;
  property!: PropertyApi;
  watchtower!: WatchtowerApi;
  competitorAssessment!: CompetitorAssessmentApi;
  dynamicComponent!: DynamicComponentApi;
  overseer!: OverseerApi;
  persona!: PersonaApi;
  portfolio!: PortfolioApi;
  portfolioInsights!: PortfolioInsightsApi;
  accountBranding!: AccountBrandingApi;

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
      { key: 'admin', class: AdminApi },
      { key: 'concept', class: ConceptApi },
      { key: 'assumption', class: AssumptionsApi },
      { key: 'marketScan', class: MarketScanApi },
      { key: 'conceptIncubate', class: IncubateConceptApi },
      { key: 'article', class: ArticleApi },
      { key: 'seed', class: SeedApi },
      { key: 'testing', class: TestingApi },
      { key: 'financialProjection', class: FinancialProjectionApi },
      { key: 'trendsAndDriversV3', class: TrendsAndDriversV3Api },
      { key: 'nucleus', class: NucleusApi },
      { key: 'ideaPlayground', class: IdeaPlaygroundApi },
      { key: 'ideaSubmissions', class: IdeaSubmissionsApi },
      { key: 'pocPlan', class: PocPlanApi },
      { key: 'property', class: PropertyApi },
      { key: 'watchtower', class: WatchtowerApi },
      { key: 'competitorAssessment', class: CompetitorAssessmentApi },
      { key: 'dynamicComponent', class: DynamicComponentApi },
      { key: 'overseer', class: OverseerApi },
      { key: 'persona', class: PersonaApi },
      { key: 'portfolio', class: PortfolioApi },
      { key: 'portfolioInsights', class: PortfolioInsightsApi },
      { key: 'accountBranding', class: AccountBrandingApi },
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

import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IMarketScan,
  IIncumbent,
  IStartup,
  ITrendV3,
  IPriorityInsightV3,
  IMarketForceV3,
} from './types';

export class MarketScanApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  getMarketScan(uuid: string) {
    return this.get<IMarketScan>(endpoints.conceptMarketScan(uuid, 'v2'));
  }

  updateMarketScan(uuid: string, data: Partial<IMarketScan>) {
    return this.patch<IMarketScan, Partial<IMarketScan>>(
      endpoints.conceptMarketScanUuid(uuid),
      data,
    );
  }

  getIncumbent(uuid: string) {
    return this.get<IIncumbent>(endpoints.incumbentUuid(uuid));
  }

  getStartup(uuid: string) {
    return this.get<IStartup>(endpoints.startupUuid(uuid));
  }

  // Market Scan V3 Methods
  getMarketScanTrendsV3(conceptUuid: string) {
    return this.get<ITrendV3[]>(
      endpoints.conceptMarketScanTrendsV3(conceptUuid),
    );
  }

  getMarketScanPriorityInsightsV3(conceptUuid: string) {
    return this.get<IPriorityInsightV3[]>(
      endpoints.conceptMarketScanPriorityInsightsV3(conceptUuid),
    );
  }

  getMarketScanMarketForcesV3(conceptUuid: string) {
    return this.get<IMarketForceV3[]>(
      endpoints.conceptMarketScanMarketForcesV3(conceptUuid),
    );
  }

  // TODO: Add trends and drivers and ecosystem endpoints for v2
}

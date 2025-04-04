import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import { IMarketScan, IIncumbent, IStartup } from './types';

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

  // TODO: Add trends and drivers and ecosystem endpoints for v2
}

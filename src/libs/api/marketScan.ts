import Api from './api';
import { ApiService, IApiServiceConfig } from './apiService';
import { Endpoints as endpoints } from './endpoints';
import { IMarketScan } from './types';

export class MarketScanApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  getMarketScan(uuid: string) {
    return this.get<IMarketScan>(endpoints.conceptMarketScanV2(uuid));
  }

  updateMarketScan(uuid: string, data: Partial<IMarketScan>) {
    return this.patch<IMarketScan, Partial<IMarketScan>>(
      endpoints.conceptMarketScanUuid(uuid),
      data,
    );
  }

  // TODO: Add trends and drivers and ecosystem endpoints for v2
}

import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints } from './endpoints';
import type {
  ITrend,
  IKeyFinding,
  ICreateTrendRequest,
  IUpdateTrendRequest,
  ICreateKeyFindingRequest,
  IUpdateKeyFindingRequest,
} from './types/concept/trendsAndDriversV3';

export class TrendsAndDriversV3Api extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // Trend CRUD operations
  getTrend(conceptUuid: string, trendUuid: string) {
    return this.get<ITrend>(Endpoints.conceptTrendV3(conceptUuid, trendUuid));
  }

  getTrends(conceptUuid: string) {
    return this.get<ITrend[]>(Endpoints.conceptTrendsV3(conceptUuid));
  }

  createTrend(conceptUuid: string, data: ICreateTrendRequest) {
    return this.post<ITrend>(Endpoints.conceptTrendsV3(conceptUuid), data);
  }

  updateTrend(
    conceptUuid: string,
    trendUuid: string,
    data: IUpdateTrendRequest,
  ) {
    return this.put<ITrend>(
      Endpoints.conceptTrendV3(conceptUuid, trendUuid),
      data,
    );
  }

  deleteTrend(conceptUuid: string, trendUuid: string) {
    return this.delete<ITrend>(
      Endpoints.conceptTrendV3(conceptUuid, trendUuid),
    );
  }

  // Key Finding CRUD operations
  getKeyFindings(conceptUuid: string, trendUuid: string) {
    return this.get<IKeyFinding[]>(
      Endpoints.conceptTrendKeyFindings(conceptUuid, trendUuid),
    );
  }

  createKeyFinding(
    conceptUuid: string,
    trendUuid: string,
    data: ICreateKeyFindingRequest,
  ) {
    return this.post<IKeyFinding>(
      Endpoints.conceptTrendKeyFindings(conceptUuid, trendUuid),
      data,
    );
  }

  updateKeyFinding(
    conceptUuid: string,
    trendUuid: string,
    keyFindingUuid: string,
    data: IUpdateKeyFindingRequest,
  ) {
    return this.put<IKeyFinding>(
      Endpoints.conceptTrendKeyFinding(conceptUuid, trendUuid, keyFindingUuid),
      data,
    );
  }

  deleteKeyFinding(
    conceptUuid: string,
    trendUuid: string,
    keyFindingUuid: string,
  ) {
    return this.delete<IKeyFinding>(
      Endpoints.conceptTrendKeyFinding(conceptUuid, trendUuid, keyFindingUuid),
    );
  }

  // Bulk operations
  getAllTrendsForConcept(conceptUuid: string) {
    return this.get<ITrend[]>(Endpoints.conceptTrendAnalysisV3(conceptUuid));
  }
}

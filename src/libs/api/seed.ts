import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IConceptSeed,
  IConceptSeedCreate,
  IPageResponse,
  ISeedQueryOptions,
} from './types';

/**
 * Seed API
 *
 * Handles all the requests for the Seed.
 */
export class SeedApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  getSeeds(options?: ISeedQueryOptions) {
    return this.get<IPageResponse<IConceptSeed>>(
      endpoints.seedQueries(options),
    );
  }

  create(seed: IConceptSeedCreate) {
    return this.post<IConceptSeed, IConceptSeedCreate>(endpoints.seed, seed);
  }
}

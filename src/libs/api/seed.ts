import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IConceptSeed,
  IConceptSeedCreate,
  IConceptSeedUpdate,
  IMessageResponse,
  IPageResponse,
  ISeedQueryOptions,
} from './types';

/**
 * Seed API
 *
 * Handles all the requests for the Seed.
 */
export class SeedApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
  }

  getSeed(
    seedUuid: string,
    options?: ISeedQueryOptions,
  ): Promise<IConceptSeed> {
    return this.get<IConceptSeed>(endpoints.seedUuid(seedUuid, options));
  }

  getSeeds(options?: ISeedQueryOptions) {
    return this.get<IPageResponse<IConceptSeed>>(
      endpoints.seedQueries(options),
    );
  }

  create(seed: IConceptSeedCreate) {
    return this.post<IConceptSeed, IConceptSeedCreate>(endpoints.seed, seed);
  }

  update(seedUuid: string, seed: IConceptSeedUpdate) {
    return this.patch<IConceptSeed, IConceptSeedUpdate>(
      endpoints.seedUuid(seedUuid),
      seed,
    );
  }

  deleteSeed(seedUuid: string, options?: ISeedQueryOptions) {
    return this.delete<IMessageResponse>(endpoints.seedUuid(seedUuid, options));
  }

  cloneSeed(seedUuid: string) {
    return this.post<IConceptSeed>(endpoints.cloneSeed(seedUuid));
  }
}

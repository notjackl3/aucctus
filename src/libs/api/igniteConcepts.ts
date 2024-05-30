import Api from './api';
import { ApiService, IApiServiceConfig } from './apiService';
import { endpoints } from './endpoints';
import { IConceptGenerate, IConceptGenerateResponse } from './types'; // Import the missing type

/**
 * Concept Ignite API
 *
 * Handles all the requests to the fast service for concept generation.
 */
export class IgniteConceptApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  igniteConcepts(concept: IConceptGenerate) {
    return this.post<IConceptGenerateResponse>(endpoints.conceptIgnite, concept, { timeout: 1200000 });
  }
}

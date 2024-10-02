import Api from './api';
import { ApiService, IApiServiceConfig } from './apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IConceptSeedAttribute,
  IConceptSeedBase,
  IGeneratedConcept,
} from './types'; // Import the missing type

/**
 * Concept Ignite API
 *
 * Handles all the requests to the fast service for concept generation.
 */
export interface IConceptGenerateResponse {
  concepts: IGeneratedConcept[];
  seed: IConceptSeedAttribute[];
}

export interface IIgniteConceptBody
  extends Omit<IConceptSeedBase, 'createdBy'> {
  numberOfConcepts?: number;
}

export class IgniteConceptApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  ignite(body: IIgniteConceptBody) {
    return this.post<IConceptGenerateResponse>(endpoints.conceptIgnite, body);
  }
}

import { ApiService } from './apiService';
import { endpoints } from './endpoints';
import { IConceptGenerate, IConceptGenerateResponse } from './types'; // Import the missing type

/**
 * Concept Ignite API
 *
 * Handles all the requests to the fast service for concept generation.
 */
export class IgniteConceptApi extends ApiService {
  igniteConcepts(concept: IConceptGenerate) {
    return this.post<IConceptGenerateResponse>(endpoints.conceptIgnite, concept);
  }
}

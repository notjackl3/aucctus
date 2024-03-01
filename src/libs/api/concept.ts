import { ApiService } from './apiService';
import { endpoints } from './endpoints';
import { GetConceptResponse } from './typings/concepts';

/**
 * Concept API
 *
 * Handles all the requests for the Concepts that require authentication.
 */
export class ConceptApi extends ApiService {
  getConcepts(status: string, category: string | undefined) {
    this.updateConfigHeaders({});
    return this.get<GetConceptResponse>(endpoints.concept, {
      params: {
        ...(status && { status }),
        ...(category && { category }),
      },
    });
  }
}

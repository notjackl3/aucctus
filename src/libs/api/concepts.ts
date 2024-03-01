import { ApiService } from './apiService';
import { IConceptQueryOptions, endpoints } from './endpoints';
import { ConceptStatus, IConcept, IConceptCreate } from './typings'; // Import the missing type
import { IPageResponse } from './typings/avxisi';

/**
 * Account API
 *
 * Handles all the requests for the accounts and users that require authentication.
 */
export class ConceptApi extends ApiService {
  getConcept(uuid: string) {
    return this.get<IConcept>(endpoints.conceptUuid(uuid));
  }

  updateConcept(concept: Partial<IConcept>, uuid: string) {
    return this.put<IConcept, Partial<IConcept>>(endpoints.conceptUuid(uuid), concept);
  }

  updateConceptStatus(uuid: string, status: ConceptStatus) {
    return this.put<IConcept>(endpoints.conceptUuid(uuid), { status });
  }

  createConcept(concept: IConceptCreate) {
    return this.post<IConcept, IConceptCreate>(endpoints.concept, concept);
  }

  batchCreateConcepts(concepts: IConceptCreate[]) {
    return this.post<IConcept[], IConceptCreate[]>(endpoints.concept, concepts);
  }

  getConcepts(options?: IConceptQueryOptions) {
    return this.get<IPageResponse<IConcept>>(endpoints.conceptQueries(options));
  }

  deleteConcept(uuid: string) {
    return this.delete<IConcept>(endpoints.conceptUuid(uuid));
  }
}

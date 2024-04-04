import { AtLeast } from '../utils';
import { ApiService } from './apiService';
import { IConceptQueryOptions, endpoints } from './endpoints';
import {
  ConceptStatus,
  IAssumption,
  IConcept,
  IConceptCreate,
  IConceptOverview,
  IConceptPage,
  ICustomerProfile,
  IFinancialProjection,
  IMarketScan,
} from './typings'; // Import the missing type
import { IPageResponse } from './typings/avxisi';

/**
 * Concept API
 *
 * Handles all the requests for the Concept.
 */
export class ConceptApi extends ApiService {
  getConcept(uuid: string) {
    return this.get<IConcept>(endpoints.conceptUuid(uuid));
  }

  updateConcept(concept: Partial<IConcept>, uuid: string) {
    return this.patch<IConcept, Partial<IConcept>>(endpoints.conceptUuid(uuid), concept);
  }

  bulkUpdateConcepts(concepts: AtLeast<IConcept, 'uuid'>[]) {
    return this.patch<IConcept[], AtLeast<IConcept, 'uuid'>[]>(endpoints.conceptList, concepts);
  }

  updateConceptStatus(uuid: string, status: ConceptStatus) {
    return this.patch<IConcept>(endpoints.conceptUuid(uuid), { status });
  }

  createConcept(concept: IConceptCreate) {
    return this.post<IConcept, IConceptCreate>(endpoints.concept, concept);
  }

  batchCreateConcepts(concepts: IConceptCreate[]) {
    return this.post<IConcept[], IConceptCreate[]>(endpoints.concept, concepts);
  }

  getConcepts(options?: IConceptQueryOptions) {
    return this.get<IConceptPage>(endpoints.conceptQueries(options));
  }

  deleteConcept(uuid: string) {
    return this.delete<IConcept>(endpoints.conceptUuid(uuid));
  }

  getConceptOverview(uuid: string) {
    return this.get<IConceptOverview>(endpoints.conceptOverview(uuid));
  }

  getConceptCustomerProfiles(uuid: string) {
    return this.get<IPageResponse<ICustomerProfile>>(endpoints.conceptCustomerProfiles(uuid));
  }

  getConceptCustomerProfile(uuid: string, profile: string) {
    return this.get<ICustomerProfile>(endpoints.conceptCustomerProfile(uuid, profile));
  }

  getConceptKeyAssumptions(uuid: string) {
    return this.get<IPageResponse<IAssumption>>(endpoints.conceptKeyAssumptions(uuid));
  }

  getConceptKeyAssumptionsUuid(uuid: string, keyAssumptionsUuid: string) {
    return this.patch<IAssumption, Partial<IAssumption>>(endpoints.conceptKeyAssumptionsUuid(uuid, keyAssumptionsUuid));
  }

  getConceptFinancialProjection(uuid: string) {
    return this.get<IFinancialProjection>(endpoints.conceptFinancialProjection(uuid));
  }

  getConceptMarketScan(uuid: string) {
    return this.get<IMarketScan>(endpoints.conceptMarketScan(uuid));
  }
}

import { AtLeast } from '../utils';
import { ApiService } from './apiService';
import { IConceptQueryOptions, endpoints } from './endpoints';
import {
  ConceptStatus,
  Ecosystem,
  IAssumption,
  IConcept,
  IConceptCreate,
  IConceptOverview,
  IConceptPage,
  ICustomerProfile,
  IFinancialProjection,
  IMarketScan,
  IMarketSizeMetric,
  ITrendsAndDrivers,
} from './types'; // Import the missing type
import { IPageResponse } from './types';

/**
 * Concept API
 *
 * Handles all the requests for the Concept.
 */
export class ConceptApi extends ApiService {
  getConcept(uuid: string) {
    return this.get<IConcept>(endpoints.conceptUuid(uuid));
  }

  retryReport(uuid: string) {
    return this.post<IConcept>(endpoints.conceptReportRetry(uuid));
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

  updateConceptOverview(uuid: string, overview: Partial<IConceptOverview>) {
    return this.patch<IConceptOverview, Partial<IConceptOverview>>(endpoints.conceptOverviewUuid(uuid), overview);
  }

  getConceptCustomerProfiles(uuid: string) {
    return this.get<IPageResponse<ICustomerProfile>>(endpoints.conceptCustomerProfiles(uuid));
  }

  getConceptCustomerProfile(customerProfileUuid: string) {
    return this.get<ICustomerProfile>(endpoints.conceptCustomerProfileUuid(customerProfileUuid));
  }

  updateConceptCustomerProfile(customerProfileUuid: string, data: Partial<ICustomerProfile>) {
    return this.patch<ICustomerProfile, Partial<ICustomerProfile>>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid),
      data
    );
  }

  deleteConceptCustomerProfile(customerProfileUuid: string) {
    return this.delete<ICustomerProfile>(endpoints.conceptCustomerProfileUuid(customerProfileUuid));
  }

  getConceptKeyAssumptions(uuid: string) {
    return this.get<IPageResponse<IAssumption>>(endpoints.conceptKeyAssumptions(uuid));
  }

  getConceptAssumption(keyAssumptionsUuid: string) {
    return this.patch<IAssumption, Partial<IAssumption>>(endpoints.conceptKeyAssumption(keyAssumptionsUuid));
  }

  updateConceptAssumption(uuid: string, data: Partial<IAssumption>) {
    return this.patch<IAssumption, Partial<IAssumption>>(endpoints.conceptKeyAssumption(uuid), data);
  }

  deleteConceptAssumption(uuid: string) {
    return this.delete<IAssumption>(endpoints.conceptKeyAssumption(uuid));
  }

  getConceptFinancialProjection(uuid: string) {
    return this.get<IFinancialProjection>(endpoints.conceptFinancialProjection(uuid));
  }

  updateConceptFinancialProjection(uuid: string, data: Partial<IFinancialProjection>) {
    return this.patch<IFinancialProjection, Partial<IFinancialProjection>>(
      endpoints.conceptFinancialProjectionUuid(uuid),
      data
    );
  }

  updateMarketMetricSize(uuid: string, data: Partial<IMarketSizeMetric>) {
    return this.patch<IMarketSizeMetric, Partial<IMarketSizeMetric>>(endpoints.conceptMarketSizeMetric(uuid), data);
  }

  getConceptMarketScan(uuid: string) {
    return this.get<IMarketScan>(endpoints.conceptMarketScan(uuid));
  }

  updateConceptMarketScan(uuid: string, data: Partial<IMarketScan>) {
    return this.patch<IMarketScan, Partial<IMarketScan>>(endpoints.conceptMarketScanUuid(uuid), data);
  }

  updateTrendAndDriver(uuid: string, data: Partial<ITrendsAndDrivers>) {
    return this.patch<ITrendsAndDrivers, Partial<ITrendsAndDrivers>>(endpoints.conceptTrendAndDriver(uuid), data);
  }

  deleteTrendAndDriver(uuid: string) {
    return this.delete<ITrendsAndDrivers>(endpoints.conceptTrendAndDriver(uuid));
  }

  updateEcosystem(uuid: string, data: Partial<Ecosystem>) {
    return this.patch<Ecosystem, Partial<Ecosystem>>(endpoints.conceptEcosystem(uuid), data);
  }

  deleteEcosystem(uuid: string) {
    return this.delete<Ecosystem>(endpoints.conceptEcosystem(uuid));
  }
}

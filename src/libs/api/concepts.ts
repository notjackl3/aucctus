import { AtLeast } from '../utils';
import Api from './api';
import { ApiService, IApiServiceConfig } from './apiService';
import { IConceptQueryOptions, endpoints } from './endpoints';
import {
  ConceptStatus,
  Ecosystem,
  IAssumption,
  IAssumptionCreate,
  IConcept,
  IConceptCreate,
  IConceptOverview,
  IConceptPage,
  IConceptSeed,
  IConceptSeedBase,
  ICustomerProfile,
  ICustomerProfileCreate,
  IEcosystemCreate,
  IFinancialProjection,
  IGeneratedConcept,
  IMarketScan,
  IMarketScanElementCreate,
  ITrendsAndDrivers,
} from './types'; // Import the missing type
import { IPageResponse } from './types';

/**
 * Concept API
 *
 * Handles all the requests for the Concept.
 */

export interface IGeneratedConceptsSaveBody {
  concepts: IGeneratedConcept[];
  seed: Omit<IConceptSeedBase, 'createdBy'>;
}

export interface IGeneratedConceptSaveResponse {
  concepts: IConcept[];
  seed: IConceptSeed;
}

export class ConceptApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  getConcept(uuid: string) {
    return this.get<IConcept>(endpoints.conceptUuid(uuid));
  }

  retryReport(uuid: string) {
    return this.post<IConcept>(endpoints.conceptReportRetry(uuid));
  }

  seed(uuid: string) {
    return this.get<IConceptSeed>(endpoints.conceptSeed(uuid));
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

  saveGeneratedConcepts(body: IGeneratedConceptsSaveBody) {
    return this.post<IConcept[], IGeneratedConceptsSaveBody>(endpoints.saveGeneratedConcepts, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
      data,
    );
  }
  createConceptCustomerProfile(customerProfileUuid: string, data: ICustomerProfileCreate) {
    return this.post<ICustomerProfile, ICustomerProfileCreate>(
      endpoints.conceptCustomerProfiles(customerProfileUuid),
      data,
    );
  }

  deleteConceptCustomerProfile(customerProfileUuid: string) {
    return this.delete<ICustomerProfile>(endpoints.conceptCustomerProfileUuid(customerProfileUuid));
  }

  getConceptKeyAssumptions(conceptUuid: string) {
    return this.get<IPageResponse<IAssumption>>(endpoints.conceptKeyAssumptions(conceptUuid));
  }

  updateConceptAssumption(uuid: string, data: Partial<IAssumption>) {
    return this.patch<IAssumption, Partial<IAssumption>>(endpoints.conceptKeyAssumption(uuid), data);
  }

  createConceptAssumption(conceptUuid: string, data: IAssumptionCreate) {
    return this.post<IAssumption, IAssumptionCreate>(endpoints.conceptKeyAssumptions(conceptUuid), data);
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
      data,
    );
  }

  // updateMarketMetricSize(uuid: string, data: Partial<IMarketSizeMetric>) {
  //   return this.patch<IMarketSizeMetric, Partial<IMarketSizeMetric>>(endpoints.conceptMarketSizeMetric(uuid), data);
  // }

  getConceptMarketScan(uuid: string) {
    return this.get<IMarketScan>(endpoints.conceptMarketScan(uuid));
  }

  updateConceptMarketScan(uuid: string, data: Partial<IMarketScan>) {
    return this.patch<IMarketScan, Partial<IMarketScan>>(endpoints.conceptMarketScanUuid(uuid), data);
  }

  updateTrendAndDriver(uuid: string, data: Partial<ITrendsAndDrivers>) {
    return this.patch<ITrendsAndDrivers, Partial<ITrendsAndDrivers>>(endpoints.conceptTrendAndDriver(uuid), data);
  }

  createTrendAndDriver(uuid: string, data: IMarketScanElementCreate) {
    return this.post<ITrendsAndDrivers, IMarketScanElementCreate>(
      endpoints.conceptMarketScanElement(uuid, 'trends-and-drivers'),
      data,
    );
  }

  deleteTrendAndDriver(uuid: string) {
    return this.delete<ITrendsAndDrivers>(endpoints.conceptTrendAndDriver(uuid));
  }

  updateEcosystem(uuid: string, data: Partial<Ecosystem>) {
    return this.patch<Ecosystem, Partial<Ecosystem>>(endpoints.conceptEcosystem(uuid), data);
  }

  createEcosystem(uuid: string, data: IEcosystemCreate) {
    return this.post<Ecosystem, IEcosystemCreate>(endpoints.conceptMarketScanElement(uuid, 'ecosystem'), data);
  }

  deleteEcosystem(uuid: string) {
    return this.delete<Ecosystem>(endpoints.conceptEcosystem(uuid));
  }
}

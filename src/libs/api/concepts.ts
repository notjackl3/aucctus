import Api from './api';
import { ApiService, IApiServiceConfig } from './apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ConceptIgnitionQuestion,
  ConceptIgnitionQuestionnaireType,
  ConceptStatus,
  Ecosystem,
  IConcept,
  IConceptCreate,
  IConceptOverview,
  IConceptPage,
  IConceptQueryOptions,
  ICustomerProfile,
  ICustomerProfileCreate,
  IEcosystemCreate,
  IFinancialProjection,
  IGeneratedConcept,
  IMarketScan,
  IMarketScanElementCreate,
  IPageResponse,
  ITrendsAndDrivers,
} from './types'; // Import the missing type

export interface IConceptSeedAnswer {
  answer: string;
  details?: string;
  question: ConceptIgnitionQuestion;
}

export interface IConceptSeed {
  answers: IConceptSeedAnswer[];
  type: ConceptIgnitionQuestionnaireType;
  createdAt: string;
  updatedAt: string;
}

/**
 * Concept API
 *
 * Handles all the requests for the Concept.
 */

export interface IGeneratedConceptsSaveBody {
  concepts: IGeneratedConcept[];
  seed: IConceptSeed;
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

  downloadConcept(uuid: string) {
    return this.get<BlobPart>(endpoints.conceptSnapshotUuid(uuid), {
      headers: {
        Accept: 'application/pdf',
      },
      responseType: 'blob', // Ensure response is treated as binary data
    });
  }

  retryReport(uuid: string) {
    return this.post<IConcept>(endpoints.conceptReportRetry(uuid));
  }

  seed(uuid: string) {
    return this.get<IConceptSeed>(endpoints.conceptSeed(uuid));
  }

  unarchive(uuid: string) {
    return this.post<IConcept>(endpoints.unarchiveConcept(uuid));
  }

  updateConcept(concept: Partial<IConcept>, uuid: string) {
    return this.patch<IConcept, Partial<IConcept>>(
      endpoints.conceptUuid(uuid),
      concept,
    );
  }

  updateConceptStatus(uuid: string, status: ConceptStatus) {
    return this.patch<IConcept>(endpoints.conceptUuid(uuid), { status });
  }

  createConcept(concept: IConceptCreate) {
    return this.post<IConcept, IConceptCreate>(endpoints.concept, concept);
  }

  saveGeneratedConcepts(body: IGeneratedConceptsSaveBody) {
    return this.post<IConcept[], IGeneratedConceptsSaveBody>(
      endpoints.saveGeneratedConcepts,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
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
    return this.patch<IConceptOverview, Partial<IConceptOverview>>(
      endpoints.conceptOverviewUuid(uuid),
      overview,
    );
  }

  getConceptCustomerProfiles(uuid: string) {
    return this.get<IPageResponse<ICustomerProfile>>(
      endpoints.conceptCustomerProfiles(uuid),
    );
  }

  getConceptCustomerProfile(customerProfileUuid: string) {
    return this.get<ICustomerProfile>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid),
    );
  }

  updateConceptCustomerProfile(
    customerProfileUuid: string,
    data: Partial<ICustomerProfile>,
  ) {
    return this.patch<ICustomerProfile, Partial<ICustomerProfile>>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid),
      data,
    );
  }
  createConceptCustomerProfile(
    conceptUuid: string,
    data: ICustomerProfileCreate,
  ) {
    return this.post<ICustomerProfile, ICustomerProfileCreate>(
      endpoints.conceptCustomerProfiles(conceptUuid),
      data,
    );
  }

  deleteConceptCustomerProfile(customerProfileUuid: string) {
    return this.delete<ICustomerProfile>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid),
    );
  }

  getConceptFinancialProjection(uuid: string) {
    return this.get<IFinancialProjection>(
      endpoints.conceptFinancialProjection(uuid),
    );
  }

  updateConceptFinancialProjection(
    uuid: string,
    data: Partial<IFinancialProjection>,
  ) {
    return this.patch<IFinancialProjection, Partial<IFinancialProjection>>(
      endpoints.conceptFinancialProjectionUuid(uuid),
      data,
    );
  }

  getConceptMarketScan(uuid: string) {
    return this.get<IMarketScan>(endpoints.conceptMarketScan(uuid));
  }

  updateConceptMarketScan(uuid: string, data: Partial<IMarketScan>) {
    return this.patch<IMarketScan, Partial<IMarketScan>>(
      endpoints.conceptMarketScanUuid(uuid),
      data,
    );
  }

  updateTrendAndDriver(uuid: string, data: Partial<ITrendsAndDrivers>) {
    return this.patch<ITrendsAndDrivers, Partial<ITrendsAndDrivers>>(
      endpoints.conceptTrendAndDriver(uuid),
      data,
    );
  }

  createTrendAndDriver(uuid: string, data: IMarketScanElementCreate) {
    return this.post<ITrendsAndDrivers, IMarketScanElementCreate>(
      endpoints.conceptMarketScanElement(uuid, 'trends-and-drivers'),
      data,
    );
  }

  deleteTrendAndDriver(uuid: string) {
    return this.delete<ITrendsAndDrivers>(
      endpoints.conceptTrendAndDriver(uuid),
    );
  }

  updateEcosystem(uuid: string, data: Partial<Ecosystem>) {
    return this.patch<Ecosystem, Partial<Ecosystem>>(
      endpoints.conceptEcosystem(uuid),
      data,
    );
  }

  createEcosystem(uuid: string, data: IEcosystemCreate) {
    return this.post<Ecosystem, IEcosystemCreate>(
      endpoints.conceptMarketScanElement(uuid, 'ecosystem'),
      data,
    );
  }

  deleteEcosystem(uuid: string) {
    return this.delete<Ecosystem>(endpoints.conceptEcosystem(uuid));
  }
}

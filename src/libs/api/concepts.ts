import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ConceptStatus,
  Ecosystem,
  IConcept,
  IConceptOverview,
  IConceptPage,
  IConceptQueryOptions,
  ICustomerProfile,
  ICustomerProfileCreate,
  IEcosystemCreate,
  IFinancialProjection,
  IMarketScanElementCreate,
  IMarketScanV1,
  IPageResponse,
  ITrendsAndDriversV1,
  SeedStatus,
} from './types'; // Import the missing type

export interface IConceptSeedAnswer {
  answer: string[];
  details?: string;
  question: ConceptIncubationQuestion;
  identifier?: string;
  id?: number;
}

export interface IConceptSeed {
  uuid: string;
  answers: IConceptSeedAnswer[];
  type: ConceptIncubationQuestionnaireType;
  createdAt: string;
  updatedAt: string;
  status?: SeedStatus;
  createdBy?: {
    firstName: string;
    lastName: string;
    uuid: string;
  };
}

// Incubation
export type FieldType = 'text' | 'textarea' | 'multiSelect' | 'radioButton';

export interface IncubationAnswerPayload {
  questionId: number;
  fieldType: FieldType;
  answer: string[];
  details?: string;
}

export interface IncubationAnswerUpdatePayload extends IncubationAnswerPayload {
  answerId: number;
}

export interface IncubationAnswer {
  answer: string[];
  details?: string;
  question: ConceptIncubationQuestion;
  id: number;
}

/**
 * Concept API
 *
 * Handles all the requests for the Concept.
 */

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

  getSeedDraftAnswers(uuid: string) {
    return this.get<IncubationAnswer[]>(
      endpoints.conceptIncubationSeedUuidAnswers(uuid),
    );
  }

  saveSeedDraftAnswer(uuid: string, answer: IncubationAnswerPayload) {
    return this.post<IncubationAnswer>(
      endpoints.conceptIncubationSeedUuidAnswer(uuid),
      answer,
    );
  }

  updateSeedDraftAnswer(answerId: number, answer: IncubationAnswerPayload) {
    return this.patch<IncubationAnswer>(
      endpoints.conceptIncubationSeedAnswerId(answerId),
      answer,
    );
  }

  updateSeedDraftAnswerAndDeleteHigherOrderAnswers(
    answerId: number,
    answer: IncubationAnswerPayload,
  ) {
    return this.patch<IncubationAnswer>(
      endpoints.conceptIncubationSeedAnswerIdAndDeleteHigherOrderAnswers(
        answerId,
      ),
      answer,
    );
  }

  deleteSeedDraftAnswer(answerId: number) {
    return this.delete<void>(endpoints.conceptIncubationSeedAnswerId(answerId));
  }

  generateConcept(uuid: string) {
    return this.post<IConcept>(endpoints.conceptGenerate(uuid));
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
    return this.get<IMarketScanV1>(endpoints.conceptMarketScan(uuid, 'v1'));
  }

  updateConceptMarketScan(uuid: string, data: Partial<IMarketScanV1>) {
    return this.patch<IMarketScanV1, Partial<IMarketScanV1>>(
      endpoints.conceptMarketScanUuid(uuid),
      data,
    );
  }

  updateTrendAndDriver(uuid: string, data: Partial<ITrendsAndDriversV1>) {
    return this.patch<ITrendsAndDriversV1, Partial<ITrendsAndDriversV1>>(
      endpoints.conceptTrendAndDriver(uuid),
      data,
    );
  }

  createTrendAndDriver(uuid: string, data: IMarketScanElementCreate) {
    return this.post<ITrendsAndDriversV1, IMarketScanElementCreate>(
      endpoints.conceptMarketScanElement(uuid, 'trends-and-drivers'),
      data,
    );
  }

  deleteTrendAndDriver(uuid: string) {
    return this.delete<ITrendsAndDriversV1>(
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

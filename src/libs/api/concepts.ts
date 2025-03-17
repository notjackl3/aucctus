import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ConceptIncubationQuestion,
  ConceptIncubationQuestionnaireType,
  ConceptSeedStatus,
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
  IMarketScanElementCreate,
  IMarketScanV1,
  IPageResponse,
  ITrendsAndDriversV1,
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
  status?: ConceptSeedStatus;
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

  seedDraft(uuid: string) {
    return this.get<IConceptSeed>(endpoints.conceptIncubationSeedUuid(uuid));
  }

  saveSeedDraft(seed: IConceptSeed) {
    return this.post<IConceptSeed, IConceptSeed>(
      endpoints.conceptIncubationSeed(),
      seed,
    );
  }

  updateSeed(seed: Partial<IConceptSeed>, uuid: string) {
    return this.patch<IConceptSeed, Partial<IConceptSeed>>(
      endpoints.conceptIncubationSeedUuid(uuid),
      seed,
    );
  }

  deleteSeedDraft(uuid: string) {
    return this.delete<IConceptSeed>(endpoints.conceptIncubationSeedUuid(uuid));
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

  getSeeds(options?: IConceptQueryOptions) {
    return this.get<IPageResponse<IConceptSeed>>(
      endpoints.conceptIncubationSeeds(options),
    );
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

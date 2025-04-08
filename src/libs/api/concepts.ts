import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ConceptIncubationQuestion,
  ConceptStatus,
  IConcept,
  IConceptOverview,
  IConceptPage,
  IConceptQueryOptions,
  IConceptReportEdit,
  ICustomerProfile,
  ICustomerProfileCreate,
  IFinancialProjection,
  IGeneratedConcept,
  IMarketScan,
  IPageResponse,
  ITrendsAndDrivers,
  QuestionFieldType,
} from './types'; // Import the missing type

export interface EditConceptReportRequest {
  concept_uuid: string;
  session_id: string; // UUID as string
  edit: IConceptReportEdit | Partial<IConceptReportEdit>;
}

// TODO: Move these types to their correct files.
export interface IncubationAnswerRequest {
  questionId: number;
  fieldType: QuestionFieldType;
  answer: string[];
  details?: string;
}

export interface IncubationAnswerUpdateRequest extends IncubationAnswerRequest {
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

  saveSeedDraftAnswer(uuid: string, answer: IncubationAnswerRequest) {
    return this.post<IncubationAnswer>(
      endpoints.conceptIncubationSeedUuidAnswer(uuid),
      answer,
    );
  }

  updateSeedDraftAnswer(answerId: number, answer: IncubationAnswerRequest) {
    return this.patch<IncubationAnswer>(
      endpoints.conceptIncubationSeedAnswerId(answerId),
      answer,
    );
  }

  updateSeedDraftAnswerAndDeleteHigherOrderAnswers(
    answerId: number,
    answer: IncubationAnswerRequest,
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

  generateConcept(
    uuid: string,
    payload?: {
      concepts?: IGeneratedConcept[];
      user_generation_instructions?: string;
    },
  ) {
    return this.post<IConcept>(endpoints.conceptGenerate(uuid), payload);
  }

  aiEditConcept(payload: EditConceptReportRequest) {
    return this.post<IConcept>(endpoints.conceptAiEditing, payload);
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
      endpoints.conceptCustomerProfiles(uuid, 'v2'),
    );
  }

  getConceptCustomerProfile(customerProfileUuid: string) {
    return this.get<ICustomerProfile>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid, 'v2'),
    );
  }

  updateConceptCustomerProfile(
    customerProfileUuid: string,
    data: Partial<ICustomerProfile>,
  ) {
    return this.patch<ICustomerProfile, Partial<ICustomerProfile>>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid, 'v2'),
      data,
    );
  }
  createConceptCustomerProfile(
    conceptUuid: string,
    data: ICustomerProfileCreate,
  ) {
    return this.post<ICustomerProfile, ICustomerProfileCreate>(
      endpoints.conceptCustomerProfiles(conceptUuid, 'v2'),
      data,
    );
  }

  deleteConceptCustomerProfile(customerProfileUuid: string) {
    return this.delete<ICustomerProfile>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid, 'v2'),
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

  deleteTrendAndDriver(uuid: string) {
    return this.delete<ITrendsAndDrivers>(
      endpoints.conceptTrendAndDriver(uuid),
    );
  }
}

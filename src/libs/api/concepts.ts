import { CustomerProfileMessage } from '@stores/customer_profile_conversations/store';
import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ConceptIncubationQuestion,
  ConceptStatus,
  IConcept,
  IConceptPage,
  IConceptQueryOptions,
  IConceptReportEdit,
  IConversation,
  IConversationFilterOptions,
  ICustomerAlternative,
  ICustomerJob,
  ICustomerPain,
  ICustomerProfile,
  ICustomerProfileCreate,
  IFinancialProjection,
  IGeneratedConcept,
  IMarketScan,
  IPageResponse,
  ITrendsAndDrivers,
  QuestionFieldType,
} from './types'; // Import the missing type
import {
  IConceptVersionList,
  IConceptVersionRevertRequestPayload,
} from './types/concept/concept_versions';
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

  generateReport(uuid: string) {
    return this.post<IConcept>(endpoints.conceptReportGenerate(uuid));
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

  saveConceptVersion(uuid: string) {
    return this.post(endpoints.saveConceptVersion(uuid));
  }

  getConceptVersions(uuid: string) {
    return this.get<IConceptVersionList>(endpoints.listConceptVersions(uuid));
  }

  revertConceptVersion(
    uuid: string,
    payload: IConceptVersionRevertRequestPayload,
  ) {
    return this.post<IConceptVersionRevertRequestPayload>(
      endpoints.revertConceptVersion(uuid),
      payload,
    );
  }

  commitConceptVersionRevert(uuid: string) {
    return this.post(endpoints.commitConceptReversion(uuid));
  }

  cancelConceptVersionRevert(uuid: string) {
    return this.post(endpoints.cancelConceptReversion(uuid));
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

  getConceptCustomerProfiles(uuid: string) {
    return this.get<IPageResponse<ICustomerProfile>>(
      endpoints.conceptCustomerProfiles(uuid, 'v2'),
    );
  }

  getConceptCustomerProfile(customerProfileUuid: string) {
    return this.get<ICustomerProfile>(
      endpoints.conceptCustomerProfileUuid(customerProfileUuid),
    );
  }

  getConceptCustomerProfileConversationMessages(
    customerProfileUuid: string,
    sessionId: string,
  ) {
    return this.get<CustomerProfileMessage[]>(
      endpoints.conceptCustomerProfileConversationMessages(
        customerProfileUuid,
        sessionId,
      ),
    );
  }

  getCustomerProfileConversationList(
    customerProfileUuid: string,
    filterOptions?: IConversationFilterOptions,
  ) {
    return this.get<IConversation[]>(
      endpoints.conceptCustomerProfileConversationList(
        customerProfileUuid,
        filterOptions,
      ),
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
      endpoints.conceptCustomerProfiles(conceptUuid, 'v2'),
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

  // Customer Jobs API
  getCustomerJobs(customerProfileUuid: string) {
    return this.get<ICustomerJob[]>(
      endpoints.customerProfileJobs(customerProfileUuid),
    );
  }

  getCustomerJob(customerProfileUuid: string, jobUuid: string) {
    return this.get<ICustomerJob>(
      endpoints.customerProfileJob(customerProfileUuid, jobUuid),
    );
  }

  createCustomerJob(
    customerProfileUuid: string,
    data: { description: string; order?: number; icon?: IconVariant },
  ) {
    return this.post<ICustomerJob>(
      endpoints.customerProfileJobs(customerProfileUuid),
      data,
    );
  }

  updateCustomerJob(
    customerProfileUuid: string,
    jobUuid: string,
    data: Partial<ICustomerJob>,
  ) {
    return this.patch<ICustomerJob>(
      endpoints.customerProfileJob(customerProfileUuid, jobUuid),
      data,
    );
  }

  deleteCustomerJob(customerProfileUuid: string, jobUuid: string) {
    return this.delete<void>(
      endpoints.customerProfileJob(customerProfileUuid, jobUuid),
    );
  }

  // Customer Pains API
  getCustomerPains(customerProfileUuid: string) {
    return this.get<ICustomerPain[]>(
      endpoints.customerProfilePains(customerProfileUuid),
    );
  }

  getCustomerPain(customerProfileUuid: string, painUuid: string) {
    return this.get<ICustomerPain>(
      endpoints.customerProfilePain(customerProfileUuid, painUuid),
    );
  }

  createCustomerPain(
    customerProfileUuid: string,
    data: { description: string; order?: number; icon?: IconVariant },
  ) {
    return this.post<ICustomerPain>(
      endpoints.customerProfilePains(customerProfileUuid),
      data,
    );
  }

  updateCustomerPain(
    customerProfileUuid: string,
    painUuid: string,
    data: Partial<ICustomerPain>,
  ) {
    return this.patch<ICustomerPain>(
      endpoints.customerProfilePain(customerProfileUuid, painUuid),
      data,
    );
  }

  deleteCustomerPain(customerProfileUuid: string, painUuid: string) {
    return this.delete<void>(
      endpoints.customerProfilePain(customerProfileUuid, painUuid),
    );
  }

  // Customer Alternatives API
  getCustomerAlternatives(customerProfileUuid: string) {
    return this.get<ICustomerAlternative[]>(
      endpoints.customerProfileAlternatives(customerProfileUuid),
    );
  }
}

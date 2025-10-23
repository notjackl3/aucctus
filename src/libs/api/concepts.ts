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
  IConversationFilterOptions,
  IConversationMessagePage,
  ICreateRealWorldSignal,
  ICustomerAlternative,
  ICustomerJob,
  ICustomerPain,
  ICustomerProfile,
  ICustomerProfileConversationPage,
  ICustomerProfileCreate,
  IExecutiveSummaries,
  IGenerationResponse,
  ICustomerProfileRealWorldSignal,
  ICustomerProfileRealWorldSignalsResponse,
  IFinancialProjection,
  IGeneratedConcept,
  IMarketScan,
  IPageResponse,
  ITrendsAndDrivers,
  IUserJourneyStep,
  QuestionFieldType,
  IConceptSnapshotDownloadServiceReady,
} from './types'; // Import the missing type
import {
  IConceptVersionList,
  IConceptVersionRevertRequestPayload,
} from './types/concept/conceptVersions';
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

export interface IncubationAnswerUpdateResponse {
  answer: IncubationAnswer;
  requires_confirmation?: boolean;
  message?: string;
}

/**
 * Concept API
 *
 * Handles all the requests for the Concept.
 */

export class ConceptApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
  }

  getConcept(identifier: string) {
    return this.get<IConcept>(endpoints.conceptIdentifier(identifier));
  }

  getConceptOverview(identifier: string) {
    return this.get<IConceptOverview>(endpoints.conceptOverview(identifier));
  }

  uploadConceptCustomImage(conceptUuid: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.post<IConceptOverview>(
      endpoints.conceptOverviewUploadImage(conceptUuid),
      formData,
    );
  }

  updateConceptImageSettings(
    conceptUuid: string,
    settings: {
      useCustomImage: boolean;
      customImageUrl?: string;
    },
  ) {
    return this.patch<IConceptOverview>(
      endpoints.conceptOverviewImageSettings(conceptUuid),
      settings,
    );
  }

  getConceptExecutiveSummaries(conceptUuid: string) {
    return this.get<IExecutiveSummaries>(
      endpoints.conceptExecutiveSummaries(conceptUuid),
    );
  }

  getConceptSnapshotDownloadServiceReady() {
    return this.get<IConceptSnapshotDownloadServiceReady>(
      endpoints.conceptSnapshotDownloadServiceReady(),
    );
  }

  generateConceptVideo(conceptUuid: string) {
    return this.post<{ detail: string; task_id: string }>(
      endpoints.conceptVideoGenerate(conceptUuid),
    );
  }

  downloadConcept(uuid: string, payload?: { editInstructions?: string }) {
    return this.post(endpoints.conceptSnapshotUuid(uuid), payload);
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
    forceDelete: boolean = false,
  ) {
    const url =
      endpoints.conceptIncubationSeedAnswerIdAndDeleteHigherOrderAnswers(
        answerId,
      );
    const urlWithParams = forceDelete ? `${url}?force_delete=true` : url;

    return this.patch<IncubationAnswerUpdateResponse>(urlWithParams, answer);
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

  generateConceptOverview(conceptIdentifier: string) {
    const result = this.post<IGenerationResponse>(
      endpoints.generateConceptOverview(conceptIdentifier),
    );

    return result;
  }

  generateKeyAssumptions(conceptIdentifier: string) {
    return this.post<IGenerationResponse>(
      endpoints.generateKeyAssumptions(conceptIdentifier),
    );
  }

  generateCustomerProfile(conceptIdentifier: string) {
    return this.post<IGenerationResponse>(
      endpoints.generateCustomerProfile(conceptIdentifier),
    );
  }

  generateMarketScan(conceptIdentifier: string) {
    return this.post<IGenerationResponse>(
      endpoints.generateMarketScan(conceptIdentifier),
    );
  }

  unarchive(uuid: string) {
    return this.post<IConcept>(endpoints.unarchiveConcept(uuid));
  }

  updateConcept(concept: Partial<IConcept>, identifier: string) {
    return this.patch<IConcept, Partial<IConcept>>(
      endpoints.conceptIdentifier(identifier),
      concept,
    );
  }

  updateConceptStatus(identifier: string, status: ConceptStatus) {
    return this.patch<IConcept>(endpoints.conceptIdentifier(identifier), {
      status,
    });
  }

  getConcepts(options?: IConceptQueryOptions) {
    return this.get<IConceptPage>(endpoints.conceptQueries(options));
  }

  deleteConcept(identifier: string) {
    return this.delete<IConcept>(endpoints.conceptIdentifier(identifier));
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

  getConceptCustomerProfileRealWorldSignals(customerProfileUuid: string) {
    return this.get<ICustomerProfileRealWorldSignalsResponse>(
      endpoints.conceptCustomerProfileRealWorldSignals(customerProfileUuid),
    );
  }

  getConceptCustomerProfileRealWorldSignalUuid(
    customerProfileUuid: string,
    realWorldSignalUuid: string,
  ) {
    return this.get<ICustomerProfileRealWorldSignal>(
      endpoints.conceptCustomerProfileRealWorldSignalUuid(
        customerProfileUuid,
        realWorldSignalUuid,
      ),
    );
  }

  createConceptCustomerProfileRealWorldSignal(
    customerProfileUuid: string,
    data: ICreateRealWorldSignal,
  ) {
    return this.post<ICustomerProfileRealWorldSignal>(
      endpoints.conceptCustomerProfileRealWorldSignals(customerProfileUuid),
      data,
    );
  }

  updateConceptCustomerProfileRealWorldSignal(
    customerProfileUuid: string,
    realWorldSignalUuid: string,
    data: Partial<ICreateRealWorldSignal>,
  ) {
    return this.patch<ICustomerProfileRealWorldSignal>(
      endpoints.conceptCustomerProfileRealWorldSignalUuid(
        customerProfileUuid,
        realWorldSignalUuid,
      ),
      data,
    );
  }

  deleteConceptCustomerProfileRealWorldSignal(
    customerProfileUuid: string,
    realWorldSignalUuid: string,
  ) {
    return this.delete<void>(
      endpoints.conceptCustomerProfileRealWorldSignalUuid(
        customerProfileUuid,
        realWorldSignalUuid,
      ),
    );
  }

  getConceptCustomerProfileConversationMessages(
    customerProfileUuid: string,
    sessionId: string,
  ) {
    return this.get<IConversationMessagePage>(
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
    return this.get<ICustomerProfileConversationPage>(
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

  cancelReport(uuid: string) {
    return this.post<IConcept>(endpoints.conceptReportCancel(uuid));
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

  // User Journey Steps API
  getCustomerJourneySteps(customerProfileUuid: string) {
    return this.get<IUserJourneyStep[]>(
      endpoints.customerProfileJourneySteps(customerProfileUuid),
    );
  }

  getCustomerJourneyStep(customerProfileUuid: string, stepUuid: string) {
    return this.get<IUserJourneyStep>(
      endpoints.customerProfileJourneyStep(customerProfileUuid, stepUuid),
    );
  }

  createCustomerJourneyStep(
    customerProfileUuid: string,
    data: {
      title: string;
      description: string;
      order?: number;
      relationType?: string;
      isProductIntervention?: boolean;
    },
  ) {
    return this.post<IUserJourneyStep>(
      endpoints.customerProfileJourneySteps(customerProfileUuid),
      data,
    );
  }

  updateCustomerJourneyStep(
    customerProfileUuid: string,
    stepUuid: string,
    data: Partial<IUserJourneyStep>,
  ) {
    return this.patch<IUserJourneyStep>(
      endpoints.customerProfileJourneyStep(customerProfileUuid, stepUuid),
      data,
    );
  }

  deleteCustomerJourneyStep(customerProfileUuid: string, stepUuid: string) {
    return this.delete<void>(
      endpoints.customerProfileJourneyStep(customerProfileUuid, stepUuid),
    );
  }

  /**
   * Tracks when a concept is viewed
   * @param conceptUuid - The UUID of the concept to track
   * @returns A promise with the response
   */
  async trackConceptView(conceptUuid: string): Promise<void> {
    return this.post(endpoints.conceptSeen(conceptUuid));
  }

  /**
   * Get estimated execution time for an agent based on historical data
   * @param agentName - The name of the agent (e.g., 'SyntheticInterviewAgent')
   * @param conceptUuid - Optional concept UUID for concept-specific timing
   * @returns Estimated seconds and history status
   */
  getAgentEstimatedTime(agentName: string, conceptUuid?: string) {
    return this.get<{
      agentName: string;
      estimatedSeconds: number | null;
      hasHistory: boolean;
    }>(endpoints.agentTiming(agentName, conceptUuid));
  }

  /**
   * Get estimated execution time for the complete synthetic interview pipeline
   * Calculates total time for all agents involved in synthetic testing process
   * @param conceptUuid - Concept UUID for concept-specific timing
   * @param numProfiles - Number of customer profiles being tested
   * @returns Total pipeline estimated seconds and history status
   */
  getSyntheticPipelineEstimate(conceptUuid: string, numProfiles: number) {
    return this.get<{
      agentName: string;
      estimatedSeconds: number | null;
      hasHistory: boolean;
    }>(endpoints.syntheticPipelineEstimate(conceptUuid, numProfiles));
  }
}

import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IStartAssessmentPayload,
  IStartAssessmentResponse,
  ISubmitAnswerPayload,
  ISubmitAnswerResponse,
  ILeadCapturePayload,
  IBriefingResponse,
  IAssessmentDetail,
  IPublicStartAssessmentPayload,
  IQuestionStatusResponse,
} from './types/valueDiscovery';

/**
 * Value Discovery API
 *
 * Handles all requests for the Value Discovery assessment flow.
 */
export class ValueDiscoveryApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  /**
   * Start a new Value Discovery assessment and get the first question.
   */
  startAssessment(data: IStartAssessmentPayload) {
    return this.post<IStartAssessmentResponse, IStartAssessmentPayload>(
      endpoints.valueDiscoveryStart,
      data,
    );
  }

  /**
   * Submit an answer and get the next question (or completion signal).
   */
  submitAnswer(assessmentUuid: string, data: ISubmitAnswerPayload) {
    return this.post<ISubmitAnswerResponse, ISubmitAnswerPayload>(
      endpoints.valueDiscoveryAnswer(assessmentUuid),
      data,
    );
  }

  /**
   * Submit lead information and trigger briefing generation.
   */
  submitLead(assessmentUuid: string, data: ILeadCapturePayload) {
    return this.post<{ detail: string }, ILeadCapturePayload>(
      endpoints.valueDiscoveryLead(assessmentUuid),
      data,
    );
  }

  /**
   * Get briefing status and result.
   */
  getBriefing(assessmentUuid: string) {
    return this.get<IBriefingResponse>(
      endpoints.valueDiscoveryBriefing(assessmentUuid),
    );
  }

  /**
   * Get full assessment details including all responses.
   */
  getAssessment(assessmentUuid: string) {
    return this.get<IAssessmentDetail>(
      endpoints.valueDiscoveryAssessment(assessmentUuid),
    );
  }

  /**
   * Export the executive briefing as a PDF download.
   */
  exportBriefingPdf(assessmentUuid: string) {
    return this.get<Blob>(
      endpoints.valueDiscoveryBriefingExport(assessmentUuid),
      { responseType: 'blob' },
    );
  }

  // ==========================================
  // Public endpoints (no auth required)
  // ==========================================

  startAssessmentPublic(data: IPublicStartAssessmentPayload) {
    return this.post<IStartAssessmentResponse, IPublicStartAssessmentPayload>(
      endpoints.valueDiscoveryPublicStart,
      data,
    );
  }

  submitAnswerPublic(assessmentUuid: string, data: ISubmitAnswerPayload) {
    return this.post<ISubmitAnswerResponse, ISubmitAnswerPayload>(
      endpoints.valueDiscoveryPublicAnswer(assessmentUuid),
      data,
    );
  }

  getQuestionStatusPublic(assessmentUuid: string) {
    return this.get<IQuestionStatusResponse>(
      endpoints.valueDiscoveryPublicQuestionStatus(assessmentUuid),
    );
  }

  submitLeadPublic(assessmentUuid: string, data: ILeadCapturePayload) {
    return this.post<{ detail: string }, ILeadCapturePayload>(
      endpoints.valueDiscoveryPublicLead(assessmentUuid),
      data,
    );
  }

  getBriefingPublic(assessmentUuid: string) {
    return this.get<IBriefingResponse>(
      endpoints.valueDiscoveryPublicBriefing(assessmentUuid),
    );
  }

  exportBriefingPdfPublic(assessmentUuid: string) {
    return this.get<Blob>(
      endpoints.valueDiscoveryPublicBriefingExport(assessmentUuid),
      { responseType: 'blob' },
    );
  }
}

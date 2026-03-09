import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IStartAssessmentResponse,
  ISubmitAnswerPayload,
  ISubmitAnswerResponse,
  ILeadCapturePayload,
  IBriefingResponse,
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

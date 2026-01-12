import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints } from './endpoints';
import type {
  IPocPlan,
  IPocPlanGenerationRequest,
  IPocPlanGenerationResponse,
  IPocPlanGenerationProgress,
  IPocPlanExistsResponse,
  IPocModalContentResponse,
} from './types';
import { Api } from './api';

/**
 * POC Plan API Service
 *
 * Handles all API interactions for POC Plan generation and retrieval.
 * Transforms backend snake_case responses to frontend camelCase.
 */
export class PocPlanApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
  }

  /**
   * Generate a POC Plan for a concept
   * This initiates the generation process and returns immediately.
   * The actual plan will be generated asynchronously via Celery task.
   * Progress updates are received via WebSocket.
   */
  async generatePocPlan(
    request: IPocPlanGenerationRequest,
  ): Promise<IPocPlanGenerationResponse> {
    return this.post<IPocPlanGenerationResponse>(
      Endpoints.pocPlanGenerate(request.conceptUuid),
      { regenerate: request.regenerate ?? false },
    );
  }

  /**
   * Get the current POC Plan for a concept
   */
  async getPocPlan(conceptUuid: string): Promise<IPocPlan | null> {
    return this.get<IPocPlan>(Endpoints.pocPlan(conceptUuid));
  }

  /**
   * Get the current generation status/progress
   */
  async getPocPlanStatus(
    conceptUuid: string,
  ): Promise<IPocPlanGenerationProgress> {
    return this.get<IPocPlanGenerationProgress>(
      Endpoints.pocPlanStatus(conceptUuid),
    );
  }

  /**
   * Update a POC Plan (for editing sections)
   */
  async updatePocPlan(
    conceptUuid: string,
    updates: Partial<IPocPlan>,
  ): Promise<IPocPlan> {
    return this.patch<IPocPlan, Partial<IPocPlan>>(
      Endpoints.pocPlan(conceptUuid),
      updates,
    );
  }

  /**
   * Check if a POC Plan exists for a concept
   */
  async hasPocPlan(conceptUuid: string): Promise<boolean> {
    const response = await this.get<IPocPlanExistsResponse>(
      Endpoints.pocPlanExists(conceptUuid),
    );
    return response.exists;
  }

  /**
   * Get contextualized modal content for a concept
   * Uses Gemini Flash Lite to generate personalized descriptions
   */
  async getModalContent(
    conceptUuid: string,
  ): Promise<IPocModalContentResponse> {
    return this.get<IPocModalContentResponse>(
      Endpoints.pocPlanModalContent(conceptUuid),
    );
  }
}

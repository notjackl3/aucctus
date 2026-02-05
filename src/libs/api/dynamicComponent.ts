/**
 * Dynamic Component API Service
 *
 * Calls osiris endpoints for AI-powered component generation.
 * The backend handles communication with aucctus-dynamic-frontend internally.
 *
 * Flow:
 * 1. Call generate() -> returns 202 with componentUuid
 * 2. Listen for WebSocket updates on 'dynamic_component.progress.account'
 * 3. When completed, call getComponent() to fetch full data
 */

import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IGenerateComponentRequest,
  IGenerateComponentResponse,
  IDynamicComponent,
  IComponentListResponse,
} from './types/dynamicComponent.d';

export class DynamicComponentApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  /**
   * Generate a new React component for a concept.
   *
   * Returns immediately with 202 Accepted. Listen for WebSocket
   * updates to know when generation completes.
   *
   * @param request - Generation request with concept UUID and report content
   * @returns Component UUID and initial status
   */
  async generate(
    request: IGenerateComponentRequest,
  ): Promise<IGenerateComponentResponse> {
    const response = await this.post<IGenerateComponentResponse>(
      endpoints.dynamicComponentGenerate,
      {
        concept_uuid: request.conceptUuid,
        report_content: request.reportContent,
        component_name: request.componentName,
      },
    );
    return {
      componentUuid: response.componentUuid,
      conceptUuid: response.conceptUuid,
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Get a component by UUID.
   *
   * @param componentUuid - UUID of the component
   * @returns Full component data including source code
   */
  async getComponent(componentUuid: string): Promise<IDynamicComponent> {
    const response = await this.get<Record<string, unknown>>(
      endpoints.dynamicComponentDetail(componentUuid),
    );
    return this.transformComponent(response);
  }

  /**
   * Get all components for a concept.
   *
   * @param conceptUuid - UUID of the concept
   * @returns List of components
   */
  async getComponentsForConcept(
    conceptUuid: string,
  ): Promise<IComponentListResponse> {
    const response = await this.get<Record<string, unknown>[]>(
      endpoints.dynamicComponentsForConcept(conceptUuid),
    );
    return {
      components: response.map((c) => this.transformComponent(c)),
    };
  }

  /**
   * Transform snake_case response to camelCase
   */
  private transformComponent(data: Record<string, unknown>): IDynamicComponent {
    return {
      uuid: data.uuid as string,
      conceptUuid: (data.concept_uuid || data.conceptUuid) as string,
      status: data.status as IDynamicComponent['status'],
      componentName: (data.component_name || data.componentName) as
        | string
        | null,
      sourceCode: (data.source_code || data.sourceCode) as string | null,
      compiledCode: (data.compiled_code || data.compiledCode) as string | null,
      prdContent: (data.prd_content || data.prdContent) as string | null,
      errorMessage: (data.error_message || data.errorMessage) as string | null,
      durationMs: (data.duration_ms || data.durationMs) as number | null,
      prdDurationMs: (data.prd_duration_ms || data.prdDurationMs) as
        | number
        | null,
      createdAt: (data.created_at || data.createdAt) as string,
      updatedAt: (data.updated_at || data.updatedAt) as string,
    };
  }
}

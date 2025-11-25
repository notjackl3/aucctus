import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { IPropertyDefinition, IPropertyConfig, PropertyType } from './types';

/**
 * Property API
 *
 * Handles all requests for dynamic property definitions.
 */
export class PropertyApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
  }

  /**
   * Get all property definitions for an account
   * @param accountUuid - The account UUID
   * @param includeInactive - Whether to include inactive properties (default: false)
   * @returns List of property definitions
   */
  getPropertyDefinitions(
    accountUuid: string,
    includeInactive: boolean = false,
  ) {
    return this.get<IPropertyDefinition[]>(
      `/api/properties/v1/definitions?account_uuid=${accountUuid}&include_inactive=${includeInactive}`,
    );
  }

  /**
   * Get a single property definition by UUID
   * @param propertyUuid - The property definition UUID
   * @returns Property definition
   */
  getPropertyDefinition(propertyUuid: string) {
    return this.get<IPropertyDefinition>(
      `/api/properties/v1/definitions/${propertyUuid}`,
    );
  }

  /**
   * Create a new property definition
   * @param accountUuid - The account UUID
   * @param data - Property definition data
   * @returns Created property definition
   */
  createPropertyDefinition(
    accountUuid: string,
    data: {
      name: string;
      key: string;
      property_type: PropertyType;
      config?: IPropertyConfig;
      description?: string;
      is_required?: boolean;
      default_value?: any;
      display_order?: number;
      icon?: string;
    },
  ) {
    return this.post<IPropertyDefinition>(
      `/api/properties/v1/definitions?account_uuid=${accountUuid}`,
      data,
    );
  }

  /**
   * Update an existing property definition
   * @param propertyUuid - The property definition UUID
   * @param data - Updated property data
   * @returns Updated property definition
   */
  updatePropertyDefinition(
    propertyUuid: string,
    data: {
      name?: string;
      config?: IPropertyConfig;
      description?: string;
      is_required?: boolean;
      default_value?: any;
      display_order?: number;
      is_active?: boolean;
      icon?: string;
    },
  ) {
    return this.patch<IPropertyDefinition>(
      `/api/properties/v1/definitions/${propertyUuid}`,
      data,
    );
  }

  /**
   * Bulk update multiple property definitions in a single transaction
   * @param updates - Array of property updates with uuid and fields to update
   * @returns Bulk update response with results for each update
   */
  bulkUpdatePropertyDefinitions(
    updates: Array<{
      uuid: string;
      name?: string;
      config?: IPropertyConfig;
      description?: string;
      is_required?: boolean;
      default_value?: any;
      display_order?: number;
      is_active?: boolean;
      icon?: string;
    }>,
  ) {
    return this.post<{
      total: number;
      successful: number;
      failed: number;
      results: Array<{
        uuid: string;
        success: boolean;
        property: IPropertyDefinition | null;
        error: string | null;
      }>;
    }>(`/api/properties/v1/definitions/bulk-update`, { updates });
  }

  /**
   * Delete (soft delete) a property definition
   * @param propertyUuid - The property definition UUID
   * @returns Success message
   */
  deletePropertyDefinition(propertyUuid: string) {
    return this.delete(`/api/properties/v1/definitions/${propertyUuid}`);
  }

  /**
   * Set a custom property value on a concept
   * @param identifier - The concept identifier
   * @param key - Property key
   * @param value - Property value
   * @returns Success response
   */
  setConceptProperty(identifier: string, key: string, value: any) {
    return this.put(`/api/properties/v1/concepts/${identifier}/properties`, {
      key,
      value,
    });
  }

  /**
   * Get all custom properties for a concept
   * @param identifier - The concept identifier
   * @returns Object with property key-value pairs
   */
  getConceptProperties(identifier: string) {
    return this.get<Record<string, any>>(
      `/api/properties/v1/concepts/${identifier}/properties`,
    );
  }

  /**
   * Remove a custom property value from a concept
   * @param identifier - The concept identifier
   * @param key - Property key to remove
   * @returns Success response
   */
  removeConceptProperty(identifier: string, key: string) {
    return this.delete(
      `/api/properties/v1/concepts/${identifier}/properties/${key}`,
    );
  }

  /**
   * Translate a natural language query into structured property filters
   * @param accountUuid - The account UUID
   * @param query - Natural language query (e.g., "Find all high priority tests")
   * @returns Translated filters with explanation
   */
  translateQuery(accountUuid: string, query: string) {
    return this.post<{
      propertyFilters: Array<{
        key: string;
        value: string | string[];
        operator: string;
      }>;
      standardFilters: Array<{
        filterType: string;
        value: string | string[];
        operator?: string;
      }>;
      explanation: string;
      originalQuery: string;
      noResultsExplanation?: string;
      // Legacy format for backward compatibility
      filters?: Array<{
        key: string;
        value: string | string[];
        operator: string;
      }>;
      original_query?: string;
    }>(`/api/properties/v1/translate-query?account_uuid=${accountUuid}`, {
      query,
    });
  }
}

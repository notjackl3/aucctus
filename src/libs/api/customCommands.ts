import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  CustomCommand,
  CustomCommandCreateRequest,
  CustomCommandForPicker,
  CustomCommandListResponse,
  CustomCommandUpdateRequest,
} from './types/customCommands';

/**
 * Custom Commands API
 *
 * Handles CRUD operations for custom Overseer commands.
 */
export class CustomCommandsApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  /**
   * Get all custom commands for the current account.
   *
   * @param includeInactive - Whether to include inactive commands (default: false)
   */
  getCustomCommands(includeInactive: boolean = false) {
    const url = includeInactive
      ? `${endpoints.customCommands}?include_inactive=true`
      : endpoints.customCommands;
    return this.get<CustomCommandListResponse>(url);
  }

  /**
   * Get custom commands in a lightweight format for the command picker.
   * Only returns active commands with minimal data.
   */
  getCustomCommandsForPicker() {
    return this.get<CustomCommandForPicker[]>(endpoints.customCommandsPicker);
  }

  /**
   * Get a specific custom command by UUID.
   *
   * @param commandUuid - The UUID of the command to retrieve
   */
  getCustomCommand(commandUuid: string) {
    return this.get<CustomCommand>(endpoints.customCommandDetail(commandUuid));
  }

  /**
   * Create a new custom command.
   *
   * @param data - The command data
   */
  createCustomCommand(data: CustomCommandCreateRequest) {
    return this.post<CustomCommand, CustomCommandCreateRequest>(
      endpoints.customCommands,
      data,
    );
  }

  /**
   * Update an existing custom command.
   *
   * @param commandUuid - The UUID of the command to update
   * @param data - The fields to update
   */
  updateCustomCommand(commandUuid: string, data: CustomCommandUpdateRequest) {
    return this.put<CustomCommand, CustomCommandUpdateRequest>(
      endpoints.customCommandDetail(commandUuid),
      data,
    );
  }

  /**
   * Delete a custom command.
   *
   * @param commandUuid - The UUID of the command to delete
   */
  deleteCustomCommand(commandUuid: string) {
    return this.delete<{ message: string }>(
      endpoints.customCommandDetail(commandUuid),
    );
  }
}

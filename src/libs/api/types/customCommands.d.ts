/**
 * Custom Commands Types
 *
 * Types for the custom commands feature in Overseer.
 * Custom commands allow users to define their own slash commands
 * with custom prompt modifiers.
 */

/**
 * Full custom command data from the API
 */
export interface CustomCommand {
  uuid: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  promptModifier: string;
  enableWebSearch: boolean;
  enableNucleusSearch: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lightweight custom command data for the command picker
 */
export interface CustomCommandForPicker {
  name: string;
  label: string;
  description: string;
  icon: string;
  enableWebSearch: boolean;
  enableNucleusSearch: boolean;
}

/**
 * Response from listing custom commands
 */
export interface CustomCommandListResponse {
  commands: CustomCommand[];
  totalCount: number;
  maxAllowed: number;
}

/**
 * Request payload for creating a custom command
 */
export interface CustomCommandCreateRequest {
  name: string;
  label: string;
  description: string;
  promptModifier: string;
  icon?: string;
  enableWebSearch?: boolean;
  enableNucleusSearch?: boolean;
}

/**
 * Request payload for updating a custom command
 */
export interface CustomCommandUpdateRequest {
  name?: string;
  label?: string;
  description?: string;
  promptModifier?: string;
  icon?: string;
  enableWebSearch?: boolean;
  enableNucleusSearch?: boolean;
  isActive?: boolean;
  order?: number;
}

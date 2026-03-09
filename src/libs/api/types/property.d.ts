export type PropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'checkbox';

/**
 * Property option with optional color
 * Supports both legacy string format and new object format
 */
export interface IPropertyOption {
  value: string;
  color?: string; // Hex color code (e.g., "#FF0000")
  icon?: string; // Icon variant (e.g., "star-01", "check-circle-broken")
}

/**
 * Property configuration
 * Supports both legacy and new formats:
 * - Legacy: { options: ["High", "Medium", "Low"] }
 * - New: { options: [{ value: "High", color: "#FF0000" }, ...] }
 */
export interface IPropertyConfig {
  options?: Array<string | IPropertyOption>;
  min?: number;
  max?: number;
}

export interface IPropertyDefinition {
  uuid: string;
  name: string;
  key: string;
  propertyType: PropertyType;
  config: IPropertyConfig;
  description: string;
  isRequired: boolean;
  defaultValue: any;
  displayOrder: number;
  isActive: boolean;
  icon?: string; // Icon variant for column header (e.g., "star-01", "lightbulb")
  keyWasAdjusted?: boolean; // True if the key was auto-renamed to avoid conflicts
  originalKey?: string; // The original key before adjustment (if adjusted)
  createdAt: string;
  updatedAt: string;
}

export interface IPropertyFilter {
  key: string;
  value: any;
  operator?:
    | 'exact'
    | 'contains'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'has'
    | 'is_null'
    | 'not_blank';
}

export interface ICreatePropertyDefinitionPayload {
  accountUuid: string;
  name: string;
  key: string;
  property_type: PropertyType;
  config?: IPropertyConfig;
  description?: string;
  is_required?: boolean;
  default_value?: any;
  display_order?: number;
  icon?: string;
}

export interface IUpdatePropertyDefinitionPayload {
  propertyUuid: string;
  name?: string;
  key?: string;
  property_type?: PropertyType;
  config?: IPropertyConfig;
  description?: string;
  is_required?: boolean;
  default_value?: any;
  display_order?: number;
  is_active?: boolean;
  icon?: string;
}

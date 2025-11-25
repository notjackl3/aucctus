import { PropertyType, IPropertyDefinition } from '@libs/api/types';

/**
 * Maps property types to their corresponding default icon variants
 * Based on the PropertyDefinitionModal icon mapping
 */
export const getPropertyTypeIcon = (propertyType: PropertyType): string => {
  switch (propertyType) {
    case 'text':
      return 'file';
    case 'number':
      return 'barchart';
    case 'select':
      return 'list';
    case 'multi_select':
      return 'columns';
    case 'checkbox':
      return 'check-circle-broken';
    default:
      return 'file'; // Default fallback
  }
};

/**
 * Gets the icon for a property definition
 * Returns custom icon if set, otherwise returns default icon for property type
 * @param property - Property definition or property type
 * @returns Icon variant string
 */
export const getPropertyIcon = (
  property: IPropertyDefinition | PropertyType,
): string => {
  // If it's a property definition object with a custom icon, use it
  if (typeof property === 'object' && property.icon) {
    return property.icon;
  }

  // If it's a property definition object without custom icon, use type default
  if (typeof property === 'object') {
    return getPropertyTypeIcon(property.propertyType);
  }

  // If it's just a property type string, use type default
  return getPropertyTypeIcon(property);
};

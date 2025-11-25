import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook to manage property cell state
 * Handles value extraction, editing state, and synchronization
 */
export const usePropertyCellState = (value: any) => {
  // Extract actual value - handle various data structures
  const actualValue = useMemo(() => {
    // If value is null or undefined, return it as-is
    if (value === null || value === undefined) {
      return value;
    }

    // If it's an array (for multi_select), return as-is
    if (Array.isArray(value)) {
      return value;
    }

    // If it's an object, try to extract the value
    if (typeof value === 'object') {
      // If it has a 'value' property, use that
      if ('value' in value) {
        const extractedValue = value.value;
        // If the extracted value is still an object or array, return it as-is
        if (typeof extractedValue === 'object') {
          return extractedValue;
        }
        return extractedValue;
      }
      // Check if it's an empty object
      if (Object.keys(value).length === 0) {
        return null;
      }
      // Otherwise, return the object as-is (might be a complex structure)
      return value;
    }

    // For primitives, return as-is
    return value;
  }, [value]);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(actualValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayValue, setDisplayValue] = useState(actualValue);

  // Sync local state with prop changes (e.g., from external updates)
  useEffect(() => {
    setEditValue(actualValue);
    setDisplayValue(actualValue);
  }, [actualValue]);

  return {
    isEditing,
    setIsEditing,
    editValue,
    setEditValue,
    isUpdating,
    setIsUpdating,
    displayValue,
    setDisplayValue,
    actualValue,
  };
};

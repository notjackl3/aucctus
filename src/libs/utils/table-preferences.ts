/**
 * Utility for managing table preferences in localStorage
 * Scoped by account UUID to support multi-account scenarios
 */

import type { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';

interface ITablePreferences {
  columnOrder?: string[];
  filters?: IConceptFilterOptions;
}

const STORAGE_KEY_PREFIX = 'aucctus_table_prefs';

/**
 * Get the storage key for a specific table and account
 */
const getStorageKey = (tableName: string, accountUuid?: string): string => {
  if (!accountUuid) return `${STORAGE_KEY_PREFIX}_${tableName}`;
  return `${STORAGE_KEY_PREFIX}_${accountUuid}_${tableName}`;
};

/**
 * Get table preferences from localStorage
 */
export const getTablePreferences = (
  tableName: string,
  accountUuid?: string,
): ITablePreferences | null => {
  try {
    const key = getStorageKey(tableName, accountUuid);
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Convert filter Sets back from arrays (Sets are serialized as arrays in JSON)
    if (parsed.filters) {
      if (parsed.filters.status && Array.isArray(parsed.filters.status)) {
        parsed.filters.status = new Set(parsed.filters.status);
      }
      if (parsed.filters.createdBy && Array.isArray(parsed.filters.createdBy)) {
        parsed.filters.createdBy = new Set(parsed.filters.createdBy);
      }
      if (
        parsed.filters.lastModifiedBy &&
        Array.isArray(parsed.filters.lastModifiedBy)
      ) {
        parsed.filters.lastModifiedBy = new Set(parsed.filters.lastModifiedBy);
      }
    }

    return parsed;
  } catch (error) {
    // Silent fail - return null for invalid data
    return null;
  }
};

/**
 * Save table preferences to localStorage
 */
export const saveTablePreferences = (
  tableName: string,
  preferences: ITablePreferences,
  accountUuid?: string,
): void => {
  try {
    const key = getStorageKey(tableName, accountUuid);

    // Convert Sets to arrays for JSON serialization
    const serializable = { ...preferences };
    if (serializable.filters) {
      serializable.filters = {
        ...serializable.filters,
        status: serializable.filters.status
          ? Array.from(serializable.filters.status)
          : undefined,
        createdBy: serializable.filters.createdBy
          ? Array.from(serializable.filters.createdBy)
          : undefined,
        lastModifiedBy: serializable.filters.lastModifiedBy
          ? Array.from(serializable.filters.lastModifiedBy)
          : undefined,
      } as any;
    }

    localStorage.setItem(key, JSON.stringify(serializable));
  } catch (error) {
    // Silent fail - localStorage might be full or disabled
  }
};

/**
 * Update only the column order in preferences
 */
export const saveColumnOrder = (
  tableName: string,
  columnOrder: string[],
  accountUuid?: string,
): void => {
  const existing = getTablePreferences(tableName, accountUuid) || {};
  saveTablePreferences(tableName, { ...existing, columnOrder }, accountUuid);
};

/**
 * Update only the filters in preferences
 */
export const saveFilters = (
  tableName: string,
  filters: IConceptFilterOptions,
  accountUuid?: string,
): void => {
  const existing = getTablePreferences(tableName, accountUuid) || {};
  saveTablePreferences(tableName, { ...existing, filters }, accountUuid);
};

/**
 * Clear all preferences for a table
 */
export const clearTablePreferences = (
  tableName: string,
  accountUuid?: string,
): void => {
  try {
    const key = getStorageKey(tableName, accountUuid);
    localStorage.removeItem(key);
  } catch (error) {
    // Silent fail
  }
};

/**
 * Clear preferences for all accounts (useful for logout)
 */
export const clearAllTablePreferences = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    // Silent fail
  }
};

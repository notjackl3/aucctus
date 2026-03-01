/**
 * Overview widget layout preferences — localStorage persistence
 *
 * Stores per-report widget config (visibility, size, order) scoped by
 * account UUID + report UUID. Follows the same pattern as persona-widget-preferences.ts.
 */

const STORAGE_KEY_PREFIX = 'aucctus_overview_widgets';

export interface PersistedOverviewWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  size: 'small' | 'medium' | 'full';
}

const getStorageKey = (reportUuid: string, accountUuid?: string): string => {
  if (!accountUuid) return `${STORAGE_KEY_PREFIX}_${reportUuid}`;
  return `${STORAGE_KEY_PREFIX}_${accountUuid}_${reportUuid}`;
};

const VALID_SIZES = new Set(['small', 'medium', 'full']);

const isValidConfig = (
  data: unknown,
): data is PersistedOverviewWidgetConfig[] => {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).id === 'string' &&
      typeof (item as Record<string, unknown>).label === 'string' &&
      typeof (item as Record<string, unknown>).visible === 'boolean' &&
      VALID_SIZES.has((item as Record<string, unknown>).size as string),
  );
};

/**
 * Load saved widget config for a nucleus overview. Returns null if nothing saved
 * or if the stored data does not match the expected shape.
 */
export const getOverviewWidgetPreferences = (
  reportUuid: string,
  accountUuid?: string,
): PersistedOverviewWidgetConfig[] | null => {
  try {
    const key = getStorageKey(reportUuid, accountUuid);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isValidConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Save widget config for a nucleus overview.
 */
export const saveOverviewWidgetPreferences = (
  reportUuid: string,
  config: PersistedOverviewWidgetConfig[],
  accountUuid?: string,
): void => {
  try {
    const key = getStorageKey(reportUuid, accountUuid);
    localStorage.setItem(key, JSON.stringify(config));
  } catch {
    // Silent fail — localStorage might be full or disabled
  }
};

/**
 * Clear saved widget config for a nucleus overview.
 */
export const clearOverviewWidgetPreferences = (
  reportUuid: string,
  accountUuid?: string,
): void => {
  try {
    const key = getStorageKey(reportUuid, accountUuid);
    localStorage.removeItem(key);
  } catch {
    // Silent fail
  }
};

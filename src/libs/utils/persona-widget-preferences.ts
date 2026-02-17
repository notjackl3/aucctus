/**
 * Persona widget layout preferences — localStorage persistence
 *
 * Stores per-persona widget config (visibility, size, order) scoped by
 * account UUID + persona UUID. Follows the same pattern as table-preferences.ts.
 */

const STORAGE_KEY_PREFIX = 'aucctus_persona_widgets';

export interface PersistedWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  size: 'small' | 'medium' | 'full';
}

const getStorageKey = (personaUuid: string, accountUuid?: string): string => {
  if (!accountUuid) return `${STORAGE_KEY_PREFIX}_${personaUuid}`;
  return `${STORAGE_KEY_PREFIX}_${accountUuid}_${personaUuid}`;
};

/**
 * Load saved widget config for a persona. Returns null if nothing saved.
 */
export const getWidgetPreferences = (
  personaUuid: string,
  accountUuid?: string,
): PersistedWidgetConfig[] | null => {
  try {
    const key = getStorageKey(personaUuid, accountUuid);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as PersistedWidgetConfig[];
  } catch {
    return null;
  }
};

/**
 * Save widget config for a persona.
 */
export const saveWidgetPreferences = (
  personaUuid: string,
  config: PersistedWidgetConfig[],
  accountUuid?: string,
): void => {
  try {
    const key = getStorageKey(personaUuid, accountUuid);
    localStorage.setItem(key, JSON.stringify(config));
  } catch {
    // Silent fail — localStorage might be full or disabled
  }
};

/**
 * Clear saved widget config for a persona.
 */
export const clearWidgetPreferences = (
  personaUuid: string,
  accountUuid?: string,
): void => {
  try {
    const key = getStorageKey(personaUuid, accountUuid);
    localStorage.removeItem(key);
  } catch {
    // Silent fail
  }
};

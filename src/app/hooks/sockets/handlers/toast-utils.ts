import { toast } from '@components';
import { toast as reactToast } from 'react-toastify';
import type { Id } from 'react-toastify';
import type { ProgressToastPayload } from '@components/Notification/toast';
import type { IConceptWorkflowMessage } from '@libs/api/types';

export type ConceptWorkflowToastRecord = {
  toastId: Id;
  data: ProgressToastPayload;
  keys: Set<string>;
};

export const conceptWorkflowToasts = new Map<
  string,
  ConceptWorkflowToastRecord
>();

// LocalStorage helpers for persistence across refreshes
const STORAGE_KEY_PREFIX = 'concept-workflow-toast-';
const TOAST_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

type PersistedToastData = {
  data: ProgressToastPayload;
  timestamp: number;
};

const persistToastData = (key: string, data: ProgressToastPayload) => {
  try {
    const persistedData: PersistedToastData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      STORAGE_KEY_PREFIX + key,
      JSON.stringify(persistedData),
    );
  } catch (e) {
    // Silently fail if storage is unavailable
  }
};

const getPersistedToastData = (key: string): ProgressToastPayload | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!stored) return null;

    const persistedData: PersistedToastData = JSON.parse(stored);

    // Check if data has expired (older than 1 hour)
    const age = Date.now() - persistedData.timestamp;
    if (age > TOAST_TTL_MS) {
      clearPersistedToastData(key);
      return null;
    }

    return persistedData.data;
  } catch (e) {
    return null;
  }
};

const clearPersistedToastData = (key: string) => {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  } catch (e) {
    // Silently fail
  }
};

export const registerToastRecordKeys = (
  record: ConceptWorkflowToastRecord,
  keys: string[],
) => {
  keys.forEach((key) => {
    if (!key) return;
    record.keys.add(key);
    conceptWorkflowToasts.set(key, record);
    persistToastData(key, record.data);
  });
};

export const getToastRecordForKeys = (
  keys: string[],
  registerKeys = false,
): ConceptWorkflowToastRecord | undefined => {
  for (const key of keys) {
    if (!key) continue;
    const record = conceptWorkflowToasts.get(key);
    if (record) {
      if (registerKeys) {
        registerToastRecordKeys(record, keys);
      }
      return record;
    }
  }
  return undefined;
};

export const clearToastRecord = (record: ConceptWorkflowToastRecord) => {
  record.keys.forEach((key) => {
    conceptWorkflowToasts.delete(key);
    clearPersistedToastData(key);
  });
  record.keys.clear();
};

export const getToastKeysFromMessage = (
  message: IConceptWorkflowMessage,
): string[] => {
  const keys: string[] = [];
  if (message.conceptRootIdentifier) {
    keys.push(message.conceptRootIdentifier);
  }
  if (message.conceptUuid) {
    keys.push(message.conceptUuid);
  }
  return keys;
};

export const dismissConceptWorkflowToastForConcept = (
  conceptUuid?: string,
  conceptIdentifier?: string,
) => {
  const keys = [conceptIdentifier, conceptUuid].filter(
    (value): value is string => Boolean(value),
  );

  if (!keys.length) return;

  const record = getToastRecordForKeys(keys);
  if (!record) return;

  toast.dismiss(record.toastId);
  clearToastRecord(record);
};

/**
 * Restore/show the progress toast for a concept workflow.
 * Creates a new toast with the current progress data if a record exists
 * and the toast is not already visible. Also checks localStorage for
 * persisted data after page refresh.
 */
export const restoreConceptWorkflowToast = (
  conceptUuid?: string,
  conceptIdentifier?: string,
) => {
  const keys = [conceptIdentifier, conceptUuid].filter(
    (value): value is string => Boolean(value),
  );

  if (!keys.length) return;

  let existing = getToastRecordForKeys(keys);

  // If no in-memory record, try to restore from localStorage
  if (!existing) {
    for (const key of keys) {
      if (!key) continue;
      const persistedData = getPersistedToastData(key);
      if (persistedData) {
        const toastId = toast.progress(persistedData);
        existing = {
          toastId,
          data: persistedData,
          keys: new Set<string>(),
        };
        registerToastRecordKeys(existing, keys);
        return;
      }
    }
    return;
  }

  // If toast is still active, do nothing
  if (reactToast.isActive(existing.toastId)) return;

  // Toast was dismissed, create a new one with the existing data
  const newToastId = toast.progress(existing.data);
  existing.toastId = newToastId;
};

/**
 * Deduplicate helper. Returns true if the messageKey was seen recently.
 */
export const createPreventDuplicate = () => {
  const recentMessages = new Set<string>();

  return (messageKey: string): boolean => {
    if (recentMessages.has(messageKey)) {
      return true;
    }
    recentMessages.add(messageKey);
    setTimeout(() => recentMessages.delete(messageKey), 2000);
    return false;
  };
};

import { Lens, lens } from '@dhmk/zustand-lens';
import { produce } from 'immer';
import type { IAppStore } from '../store';

/**
 * JTBD Active View Store
 *
 * Mirrors the current JTBD canvas view state so that consumers outside of
 * the `JTBDViewProvider` tree (e.g. the Overseer actions module) can read
 * the active config, selected scans, and selected job without threading
 * React context.
 *
 * Also tracks per-config "job edit in progress" sets so the canvas can:
 * - Show a loading badge on any job actively being edited by Ask Aucctus
 * - Gate the Rescan button while any edit is in flight for the active config
 *
 * The editing map is populated from three sources:
 *   1. API hydration on config load (survives page refresh, cross-client state)
 *   2. Local optimistic `onMutate` from `useJobEdit` (instant feedback)
 *   3. WS events `jtbd.job.edit.started.account` / `jtbd.job.edited.account`
 *      / `jtbd.job.edit.error.account` (authoritative, cross-client)
 *
 * This slice is populated via a `useEffect` bridge inside `JTBDCanvasInner`
 * and is reset to its initial (null/empty) values when the canvas unmounts
 * so stale state doesn't leak across routes.
 */
export interface IJtbdActiveState {
  activeConfigUuid: string | null;
  selectedScanUuids: string[];
  selectedJobUuid: string | null;
  /**
   * Per-config set of job UUIDs that currently have an Ask Aucctus edit in
   * flight. Stored as `string[]` for Zustand/immer friendliness; reads that
   * need set semantics should wrap with `new Set(...)`.
   */
  editingJobUuidsByConfig: Record<string, string[]>;
  setActiveConfigUuid: (uuid: string | null) => void;
  setSelectedScanUuids: (uuids: string[]) => void;
  setSelectedJobUuid: (uuid: string | null) => void;
  /** Replace the editing-jobs set for a config (used during API hydration). */
  setEditingJobUuidsForConfig: (configUuid: string, jobUuids: string[]) => void;
  /** Add a job UUID to the editing set. Idempotent. */
  addEditingJobUuid: (configUuid: string, jobUuid: string) => void;
  /** Remove a job UUID from the editing set. Safe if absent. */
  removeEditingJobUuid: (configUuid: string, jobUuid: string) => void;
  reset: () => void;
}

export const initialJtbdActiveState = {
  activeConfigUuid: null as string | null,
  selectedScanUuids: [] as string[],
  selectedJobUuid: null as string | null,
  editingJobUuidsByConfig: {} as Record<string, string[]>,
};

const jtbdActiveSlice: Lens<IJtbdActiveState, IAppStore> = (set) => {
  return {
    activeConfigUuid: null,
    selectedScanUuids: [],
    selectedJobUuid: null,
    editingJobUuidsByConfig: {},

    setActiveConfigUuid: (uuid: string | null) => {
      set(
        produce((state: IJtbdActiveState) => {
          state.activeConfigUuid = uuid;
        }),
      );
    },

    setSelectedScanUuids: (uuids: string[]) => {
      set(
        produce((state: IJtbdActiveState) => {
          state.selectedScanUuids = uuids;
        }),
      );
    },

    setSelectedJobUuid: (uuid: string | null) => {
      set(
        produce((state: IJtbdActiveState) => {
          state.selectedJobUuid = uuid;
        }),
      );
    },

    setEditingJobUuidsForConfig: (configUuid: string, jobUuids: string[]) => {
      set(
        produce((state: IJtbdActiveState) => {
          // Dedupe while preserving insertion order.
          const seen = new Set<string>();
          const next: string[] = [];
          for (const uuid of jobUuids) {
            if (!seen.has(uuid)) {
              seen.add(uuid);
              next.push(uuid);
            }
          }
          state.editingJobUuidsByConfig[configUuid] = next;
        }),
      );
    },

    addEditingJobUuid: (configUuid: string, jobUuid: string) => {
      set(
        produce((state: IJtbdActiveState) => {
          const existing = state.editingJobUuidsByConfig[configUuid] ?? [];
          if (!existing.includes(jobUuid)) {
            state.editingJobUuidsByConfig[configUuid] = [...existing, jobUuid];
          }
        }),
      );
    },

    removeEditingJobUuid: (configUuid: string, jobUuid: string) => {
      set(
        produce((state: IJtbdActiveState) => {
          const existing = state.editingJobUuidsByConfig[configUuid];
          if (!existing) return;
          const next = existing.filter((uuid) => uuid !== jobUuid);
          if (next.length === 0) {
            delete state.editingJobUuidsByConfig[configUuid];
          } else {
            state.editingJobUuidsByConfig[configUuid] = next;
          }
        }),
      );
    },

    reset: () => {
      set(
        produce((state: IJtbdActiveState) => {
          state.activeConfigUuid = null;
          state.selectedScanUuids = [];
          state.selectedJobUuid = null;
          state.editingJobUuidsByConfig = {};
        }),
      );
    },
  };
};

export default lens<IJtbdActiveState, IAppStore>(jtbdActiveSlice);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface IColumnVisibilityStore {
  /**
   * Set of property keys that are currently visible as columns
   */
  visiblePropertyColumns: Set<string>;

  /**
   * Set of all known property keys (used to detect new properties)
   */
  knownPropertyKeys: Set<string>;

  /**
   * Set of property keys that should wrap text (default is no-wrap)
   */
  wrappedColumns: Set<string>;

  /**
   * Set of static column IDs that are currently visible
   */
  visibleStaticColumns: Set<string>;

  /**
   * Toggle visibility of a single column
   * @param key - The property key to toggle
   */
  toggleColumnVisibility: (key: string) => void;

  /**
   * Set multiple columns as visible
   * @param keys - Array of property keys to make visible
   */
  setVisibleColumns: (keys: string[]) => void;

  /**
   * Update the set of known property keys
   * @param keys - Array of all property keys that exist
   */
  setKnownPropertyKeys: (keys: string[]) => void;

  /**
   * Toggle text wrapping for a column
   * @param key - The property key to toggle wrapping for
   */
  toggleColumnWrap: (key: string) => void;

  /**
   * Check if a column should wrap text
   * @param key - The property key to check
   */
  isColumnWrapped: (key: string) => boolean;

  /**
   * Toggle visibility of a static column
   * @param columnId - The static column ID to toggle
   */
  toggleStaticColumnVisibility: (columnId: string) => void;

  /**
   * Set multiple static columns as visible
   * @param columnIds - Array of static column IDs to make visible
   */
  setVisibleStaticColumns: (columnIds: string[]) => void;

  /**
   * Check if a static column is visible
   * @param columnId - The static column ID to check
   */
  isStaticColumnVisible: (columnId: string) => boolean;

  /**
   * Clear all visible columns
   */
  clearVisibleColumns: () => void;

  /**
   * Reset to default state (all columns visible)
   */
  reset: () => void;
}

/**
 * Store for managing table column visibility
 * Persists to localStorage so user preferences are maintained across sessions
 */
export const useColumnVisibilityStore = create<IColumnVisibilityStore>()(
  persist(
    (set, get) => ({
      visiblePropertyColumns: new Set<string>(),
      knownPropertyKeys: new Set<string>(),
      wrappedColumns: new Set<string>(),
      visibleStaticColumns: new Set<string>([
        'title',
        'createdBy',
        'createdAt',
        'lastModifiedBy',
        'updatedAt',
        'status',
        'priority',
      ]),

      toggleColumnVisibility: (key: string) => {
        set((state) => {
          const newSet = new Set(state.visiblePropertyColumns);
          if (newSet.has(key)) {
            newSet.delete(key);
          } else {
            newSet.add(key);
          }
          return { visiblePropertyColumns: newSet };
        });
      },

      setVisibleColumns: (keys: string[]) => {
        set({ visiblePropertyColumns: new Set(keys) });
      },

      setKnownPropertyKeys: (keys: string[]) => {
        set({ knownPropertyKeys: new Set(keys) });
      },

      toggleColumnWrap: (key: string) => {
        set((state) => {
          const newSet = new Set(state.wrappedColumns);
          if (newSet.has(key)) {
            newSet.delete(key);
          } else {
            newSet.add(key);
          }
          return { wrappedColumns: newSet };
        });
      },

      isColumnWrapped: (key: string) => {
        return get().wrappedColumns.has(key);
      },

      toggleStaticColumnVisibility: (columnId: string) => {
        set((state) => {
          const newSet = new Set(state.visibleStaticColumns);
          if (newSet.has(columnId)) {
            newSet.delete(columnId);
          } else {
            newSet.add(columnId);
          }
          return { visibleStaticColumns: newSet };
        });
      },

      setVisibleStaticColumns: (columnIds: string[]) => {
        set({ visibleStaticColumns: new Set(columnIds) });
      },

      isStaticColumnVisible: (columnId: string) => {
        return get().visibleStaticColumns.has(columnId);
      },

      clearVisibleColumns: () => {
        set({ visiblePropertyColumns: new Set() });
      },

      reset: () => {
        set({
          visiblePropertyColumns: new Set(),
          knownPropertyKeys: new Set(),
          wrappedColumns: new Set(),
          visibleStaticColumns: new Set([
            'title',
            'createdBy',
            'createdAt',
            'lastModifiedBy',
            'updatedAt',
            'status',
            'priority',
          ]),
        });
      },
    }),
    {
      name: 'aucctus-column-visibility',
      storage: createJSONStorage(() => localStorage),
      // Custom serialization to handle Set
      partialize: (state) => ({
        visiblePropertyColumns: Array.from(state.visiblePropertyColumns),
        knownPropertyKeys: Array.from(state.knownPropertyKeys),
        wrappedColumns: Array.from(state.wrappedColumns),
        visibleStaticColumns: Array.from(state.visibleStaticColumns),
      }),
      // Custom deserialization to convert array back to Set
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        visiblePropertyColumns: new Set(
          persistedState?.visiblePropertyColumns || [],
        ),
        knownPropertyKeys: new Set(persistedState?.knownPropertyKeys || []),
        wrappedColumns: new Set(persistedState?.wrappedColumns || []),
        visibleStaticColumns: new Set(
          persistedState?.visibleStaticColumns || [
            'title',
            'createdBy',
            'createdAt',
            'lastModifiedBy',
            'updatedAt',
            'status',
            'priority',
          ],
        ),
      }),
    },
  ),
);

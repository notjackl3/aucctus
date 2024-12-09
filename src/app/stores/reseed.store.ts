import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IConceptSeed } from '@libs/api/concepts';

interface ReseedStoreState {
  seed: IConceptSeed | undefined;
  setSeed: (seed: IConceptSeed) => void;
  clear: () => void;
}

export const useReseedStore = create<ReseedStoreState>()(
  persist(
    (set) => ({
      seed: undefined,
      setSeed: (seed: IConceptSeed) => {
        set({ seed });
      },

      clear: () => {
        set({
          seed: undefined,
        });
      },
    }),
    {
      name: 'reseed-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        seed: state.seed,
      }),
    },
  ),
);

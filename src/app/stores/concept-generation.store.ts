import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IConceptSeedBase, IGeneratedConcept } from '../../libs/api/types';

interface ConceptGenerationStoreState {
  generatedConcepts: IGeneratedConcept[];
  seed: Omit<IConceptSeedBase, 'createdBy'>;

  setGeneratedConcepts: (concepts: IGeneratedConcept[]) => void;
  setSeed: (seed: Omit<IConceptSeedBase, 'createdBy'>) => void;
  clear: () => void;
}

export const useConceptGenerationStore = create<ConceptGenerationStoreState>()(
  persist(
    (set) => ({
      generatedConcepts: [],
      seed: {
        attributes: [],
        type: 'UNKNOWN',
      },
      setGeneratedConcepts: (concepts: IGeneratedConcept[]) => {
        set({ generatedConcepts: concepts });
      },
      setSeed: (seed: Omit<IConceptSeedBase, 'createdBy'>) => {
        set({ seed });
      },

      clear() {
        set({ generatedConcepts: [], seed: { attributes: [], type: 'UNKNOWN' } });
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ generatedConcepts: state.generatedConcepts, seed: state.seed }),
    },
  ),
);

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IGeneratedConcept } from '@libs/api/types';

interface ConceptGenerationStoreState {
  generatedConcepts: Record<string, IGeneratedConcept[]>;

  setGeneratedConcepts: (
    seedUuid: string,
    concepts: IGeneratedConcept[],
  ) => void;
  updateGeneratedConcept: (
    seedUuid: string,
    concept: IGeneratedConcept,
  ) => void;
  clearGeneratedConceptsBySeedUuid: (seedUuid: string) => void;
  clear: () => void;
}

export const useConceptGenerationStore = create<ConceptGenerationStoreState>()(
  persist(
    (set) => ({
      generatedConcepts: {},
      setGeneratedConcepts: (
        seedUuid: string,
        concepts: IGeneratedConcept[],
      ) => {
        set((state) => ({
          generatedConcepts: {
            ...state.generatedConcepts,
            [seedUuid]: concepts,
          },
        }));
      },

      updateGeneratedConcept: (
        seedUuid: string,
        concept: IGeneratedConcept,
      ) => {
        set((state) => ({
          generatedConcepts: {
            ...state.generatedConcepts,
            [seedUuid]: state.generatedConcepts[seedUuid].map((c) =>
              c.uuid === concept.uuid ? concept : c,
            ),
          },
        }));
      },

      clearGeneratedConceptsBySeedUuid: (seedUuid: string) => {
        set((state) => ({
          generatedConcepts: {
            ...state.generatedConcepts,
            [seedUuid]: [],
          },
        }));
      },

      clear() {
        set({
          generatedConcepts: {},
        });
      },
    }),
    {
      name: 'concept-generation-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        generatedConcepts: state.generatedConcepts,
      }),
    },
  ),
);

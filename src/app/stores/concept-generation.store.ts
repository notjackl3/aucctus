import { IIgnitionAnswer } from '@libs/api/igniteConcepts';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  IConceptIgnitionQuestionnaireType,
  IGeneratedConcept,
  QuestionIdentifier,
} from '../../libs/api/types';

interface IIgnitionSeed {
  type?: IConceptIgnitionQuestionnaireType;
  answers: { [key in QuestionIdentifier]?: IIgnitionAnswer };
}
interface ConceptGenerationStoreState {
  generatedConcepts: IGeneratedConcept[];
  seed: IIgnitionSeed;

  setGeneratedConcepts: (concepts: IGeneratedConcept[]) => void;
  setSeed: (seed: IIgnitionSeed) => void;
  clear: () => void;
}

export const useConceptGenerationStore = create<ConceptGenerationStoreState>()(
  persist(
    (set) => ({
      generatedConcepts: [],
      seed: {
        answers: {},
      },
      setGeneratedConcepts: (concepts: IGeneratedConcept[]) => {
        set({ generatedConcepts: concepts });
      },
      setSeed: (seed: IIgnitionSeed) => {
        set({ seed });
      },

      clear() {
        set({
          generatedConcepts: [],
          seed: { answers: {}, type: undefined },
        });
      },
    }),
    {
      name: 'concept-ignition-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        generatedConcepts: state.generatedConcepts,
        seed: state.seed,
      }),
    },
  ),
);

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { QuestionnaireSection } from '@pages/Concept/Ignition/IncubateConcept';
import { FieldType } from '@libs/api/concepts';

export type AnswerItem = {
  answer: string;
  uuid: string;
};

export type SubmittedAnswer = {
  answer: string[];
  details?: string;
  uuid: string;
  fieldType: FieldType;
  questionId: number;
};

export interface IAISuggestionList {
  suggestions: IAISuggestion[];
}

interface IAISuggestion {
  title: string;
  description: string;
}

type IncubationAISuggestions = {
  [key: string]: IAISuggestionList[];
};

interface ConceptIncubationStoreState {
  currentQuestionIndex?: number;
  activeQuestionnaire?: QuestionnaireSection;
  draftSeedUuid: string;
  currentAnswerFieldType: FieldType;
  currentTextAnswerList: AnswerItem[];
  currentMultiSelectAnswerList: AnswerItem[];
  submittedAnswers: SubmittedAnswer[];

  suggestions: IncubationAISuggestions;

  setCurrentQuestionIndex: (index?: number) => void;
  setActiveQuestionnaire: (questionnaire?: QuestionnaireSection) => void;
  setDraftSeedUuid: (uuid: string) => void;
  setCurrentTextAnswerList: (answerList: AnswerItem[]) => void;
  setCurrentMultiSelectAnswerList: (answerList: AnswerItem[]) => void;
  setCurrentAnswerFieldType: (fieldType: FieldType) => void;
  setSubmittedAnswers: (answers: SubmittedAnswer[]) => void;
  resetQuestionnaire: () => void;

  setSuggestions: (identifier: string, suggestions: IAISuggestions[]) => void;
}

export const useConceptIncubationStore = create<ConceptIncubationStoreState>()(
  persist(
    (set, get) => ({
      currentQuestionIndex: undefined,
      activeQuestionnaire: undefined,
      draftSeedUuid: '',
      currentAnswerFieldType: 'text',
      currentTextAnswerList: [],
      currentMultiSelectAnswerList: [],
      submittedAnswers: [],

      suggestions: {},

      setCurrentQuestionIndex: (index?: number) => {
        set({ currentQuestionIndex: index });
      },
      setActiveQuestionnaire: (questionnaire?: QuestionnaireSection) => {
        set({ activeQuestionnaire: questionnaire });
      },
      setDraftSeedUuid: (uuid: string) => {
        set({ draftSeedUuid: uuid });
      },
      setCurrentTextAnswerList: (answerList: AnswerItem[]) => {
        set({ currentTextAnswerList: answerList });
      },
      setCurrentMultiSelectAnswerList: (answerList: AnswerItem[]) => {
        set({ currentMultiSelectAnswerList: answerList });
      },
      setCurrentAnswerFieldType: (fieldType: FieldType) => {
        set({ currentAnswerFieldType: fieldType });
      },
      setSubmittedAnswers: (answers: SubmittedAnswer[]) => {
        set({ submittedAnswers: answers });
      },
      resetQuestionnaire: () => {
        set({
          currentQuestionIndex: undefined,
          activeQuestionnaire: undefined,
          draftSeedUuid: '',
          currentTextAnswerList: [],
          currentMultiSelectAnswerList: [],
        });
      },

      setSuggestions: (identifier: string, aiSuggestions: IAISuggestions[]) => {
        set({
          suggestions: { ...get().suggestions, [identifier]: aiSuggestions },
        });
      },
    }),
    {
      name: 'concept-incubation-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentQuestionIndex: state.currentQuestionIndex,
        activeQuestionnaire: state.activeQuestionnaire,
        draftSeedUuid: state.draftSeedUuid,
        currentAnswerFieldType: state.currentAnswerFieldType,
        currentTextAnswerList: state.currentTextAnswerList,
        currentMultiSelectAnswerList: state.currentMultiSelectAnswerList,
        submittedAnswers: state.submittedAnswers,
        suggestions: state.suggestions,
      }),
    },
  ),
);

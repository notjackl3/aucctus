import { IncubationAnswer } from '@libs/api/concepts';
import {
  ConceptIncubationClarifyingQuestion,
  ConceptIncubationQuestion,
} from '@libs/api/types';
import { QuestionnaireSection } from '@pages/Concept/Incubation/IncubateConcept';
import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { NonFunctionProperties } from '../../types';

export type AnswerItem = {
  answer: string;
  uuid: string;
};

interface IAISuggestion {
  title: string;
  description: string;
}

type IncubationAISuggestions = {
  [key: number]: IAISuggestion[];
};

interface ConceptIncubationStoreState {
  currentQuestionOrder?: number;
  activeQuestionnaire?: QuestionnaireSection;
  draftSeedUuid: string;
  currentTextAnswerList: AnswerItem[];
  currentMultiSelectAnswerList: AnswerItem[];
  submittedAnswers: IncubationAnswer[];
  clarifyingQuestions: ConceptIncubationClarifyingQuestion[];
  activeClarifyingQuestion: ConceptIncubationClarifyingQuestion | undefined;
  suggestions: IncubationAISuggestions;

  setCurrentQuestionOrder: (order?: number) => void;
  setActiveQuestionnaire: (questionnaire?: QuestionnaireSection) => void;
  setDraftSeedUuid: (uuid: string) => void;
  setCurrentTextAnswerList: (answerList: AnswerItem[]) => void;
  setCurrentMultiSelectAnswerList: (answerList: AnswerItem[]) => void;
  setClarifyingQuestions: (
    questions: ConceptIncubationClarifyingQuestion[],
  ) => void;
  setSubmittedAnswers: (answers: IncubationAnswer[]) => void;
  resetQuestionnaire: () => void;

  setSuggestions: (id: number, suggestions: IAISuggestion[]) => void;
  setActiveClarifyingQuestion: (
    question: ConceptIncubationClarifyingQuestion | undefined,
  ) => void;
}

type ConceptIncubationState =
  NonFunctionProperties<ConceptIncubationStoreState>;

const INITIAL_STATE: ConceptIncubationState = {
  currentQuestionOrder: undefined,
  activeQuestionnaire: undefined,
  activeClarifyingQuestion: undefined,
  draftSeedUuid: '',
  currentTextAnswerList: [],
  currentMultiSelectAnswerList: [],
  submittedAnswers: [],
  clarifyingQuestions: [],
  suggestions: {},
};

const conceptIncubationStore = create<ConceptIncubationStoreState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setCurrentQuestionOrder: (index?: number) => {
        set({ currentQuestionOrder: index });
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
      setSubmittedAnswers: (answers: IncubationAnswer[]) => {
        set({ submittedAnswers: answers });
      },
      setClarifyingQuestions: (
        questions: ConceptIncubationClarifyingQuestion[],
      ) => {
        set({ clarifyingQuestions: questions });
      },
      setActiveClarifyingQuestion: (
        question: ConceptIncubationClarifyingQuestion | undefined,
      ) => {
        set({ activeClarifyingQuestion: question });
      },
      resetQuestionnaire: () => {
        set(INITIAL_STATE);
      },

      setSuggestions: (id: number, aiSuggestions: IAISuggestion[]) => {
        set((state) => ({
          suggestions: {
            ...state.suggestions,
            [id]: aiSuggestions,
          },
        }));
      },
    }),
    {
      name: 'concept-incubation-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentQuestionOrder: state.currentQuestionOrder,
        activeQuestionnaire: state.activeQuestionnaire,
        draftSeedUuid: state.draftSeedUuid,
        currentTextAnswerList: state.currentTextAnswerList,
        currentMultiSelectAnswerList: state.currentMultiSelectAnswerList,
        submittedAnswers: state.submittedAnswers,
        clarifyingQuestions: state.clarifyingQuestions,
        suggestions: state.suggestions,
      }),
    },
  ),
);

export const useConceptIncubationStore = () => {
  const store = conceptIncubationStore();
  const { activeQuestionnaire, currentQuestionOrder } = store;

  const questions = useMemo(() => {
    if (!activeQuestionnaire) return [];

    return Object.values(activeQuestionnaire.questions).filter(
      (question) => question.order > 0,
    );
  }, [activeQuestionnaire]);

  const shouldShowQuestion = useCallback(
    (question: ConceptIncubationQuestion, answers: IncubationAnswer[]) => {
      if (question.dependsOn) {
        const dependentAnswer = answers.find(
          (answer) => answer.question.identifier === question.dependsOn,
        );

        if (dependentAnswer && question.dependsOnValue) {
          return dependentAnswer.answer.some((answer) =>
            question.dependsOnValue?.includes(answer),
          );
        }
      }

      return true;
    },
    [],
  );

  const getNextQuestion = useCallback(
    (answers: IncubationAnswer[]): ConceptIncubationQuestion | undefined => {
      if (currentQuestionOrder === undefined) return;

      const eligibleQuestions = questions
        .filter((question) => !!question.identifier)
        .filter(
          (question) =>
            question.order > currentQuestionOrder &&
            shouldShowQuestion(question, answers),
        )
        .sort((a, b) => a.order - b.order);

      // Return the first eligible question (the one with the lowest order above currentQuestionOrder)
      return eligibleQuestions[0];
    },
    [currentQuestionOrder, questions, shouldShowQuestion],
  );

  const getPreviousQuestion = useCallback(
    (answers: IncubationAnswer[]) => {
      if (!currentQuestionOrder) return;

      const previousQuestion = [...answers]
        .filter((answer) => !!answer.question.identifier) // filter out clarifying questions
        .map((answer) => answer.question)
        .sort((a, b) => b.order - a.order)
        .find((question) => question.order < currentQuestionOrder);

      return previousQuestion;
    },
    [currentQuestionOrder],
  );

  const totalSteps = useMemo(() => {
    if (!questions) return 0;

    const highestOrderNumber = Math.max(
      ...questions.map((question) => question.order),
    );
    return Math.floor(highestOrderNumber);
  }, [questions]);

  const currentStep = useMemo(() => {
    return Math.floor(currentQuestionOrder ?? 0);
  }, [currentQuestionOrder]);

  const activeQuestion = useMemo(() => {
    return questions.find(
      (question) => question.order === currentQuestionOrder,
    );
  }, [questions, currentQuestionOrder]);

  const enhancedStore = {
    ...store,
    getNextQuestion,
    getPreviousQuestion,
    totalSteps,
    currentStep,
    activeQuestion,
  };

  return enhancedStore;
};

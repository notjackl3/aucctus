import { IncubationAnswer } from '@libs/api/concepts';
import {
  IAISuggestion,
  IClarifyingQuestion,
  IConceptIncubationQuestionnaireSection,
  IGeneratedConcept,
} from '@libs/api/types';
import { IStoreApi } from '@stores/store';
import { IConceptIncubationState } from './store';

export type AnswerItem = {
  answer: string;
  uuid: string;
};

export type IncubationAISuggestions = {
  [key: number]: IAISuggestion[];
};

export interface IConceptIncubationActions {
  setCurrentQuestionOrder: (index?: number) => void;
  setActiveQuestionnaire: (
    questionnaire?: IConceptIncubationQuestionnaireSection,
  ) => void;
  setDraftSeedUuid: (uuid: string) => void;
  setCurrentTextAnswerList: (answerList: AnswerItem[]) => void;
  setCurrentMultiSelectAnswerList: (answerList: AnswerItem[]) => void;
  setSubmittedAnswers: (answers: IncubationAnswer[]) => void;
  setClarifyingQuestions: (questions: IClarifyingQuestion[]) => void;
  setActiveClarifyingQuestion: (
    question: IClarifyingQuestion | undefined,
  ) => void;
  setActiveGeneratedConcept: (concept: IGeneratedConcept | undefined) => void;
  resetQuestionnaire: () => void;
  setSuggestions: (id: number, aiSuggestions: IAISuggestion[]) => void;
}

export function setCurrentQuestionOrder(
  this: IStoreApi<IConceptIncubationState>,
  index?: number,
) {
  this.set({ currentQuestionOrder: index });
}

export function setActiveQuestionnaire(
  this: IStoreApi<IConceptIncubationState>,
  questionnaire?: IConceptIncubationQuestionnaireSection,
) {
  this.set({ activeQuestionnaire: questionnaire });
}

export function setDraftSeedUuid(
  this: IStoreApi<IConceptIncubationState>,
  uuid: string,
) {
  this.set({ draftSeedUuid: uuid });
}

export function setCurrentTextAnswerList(
  this: IStoreApi<IConceptIncubationState>,
  answerList: AnswerItem[],
) {
  this.set({ currentTextAnswerList: answerList });
}

export function setCurrentMultiSelectAnswerList(
  this: IStoreApi<IConceptIncubationState>,
  answerList: AnswerItem[],
) {
  this.set({ currentMultiSelectAnswerList: answerList });
}

export function setSubmittedAnswers(
  this: IStoreApi<IConceptIncubationState>,
  answers: IncubationAnswer[],
) {
  this.set({ submittedAnswers: answers });
}

export function setClarifyingQuestions(
  this: IStoreApi<IConceptIncubationState>,
  questions: IClarifyingQuestion[],
) {
  this.set({ clarifyingQuestions: questions });
}

export function setActiveClarifyingQuestion(
  this: IStoreApi<IConceptIncubationState>,
  question: IClarifyingQuestion | undefined,
) {
  this.set({ activeClarifyingQuestion: question });
}

export function setActiveGeneratedConcept(
  this: IStoreApi<IConceptIncubationState>,
  concept: IGeneratedConcept | undefined,
) {
  this.set({ activeGeneratedConcept: concept });
}

export function resetQuestionnaire(this: IStoreApi<IConceptIncubationState>) {
  this.set({
    status: 'pre-generation',
    currentQuestionOrder: undefined,
    activeQuestionnaire: undefined,
    activeClarifyingQuestion: undefined,
    draftSeedUuid: '',
    currentTextAnswerList: [],
    currentMultiSelectAnswerList: [],
    submittedAnswers: [],
    clarifyingQuestions: [],
    activeGeneratedConcept: undefined,
    suggestions: {},
  });
}

export function setSuggestions(
  this: IStoreApi<IConceptIncubationState>,
  id: number,
  aiSuggestions: IAISuggestion[],
) {
  this.set({ suggestions: { ...this.get().suggestions, [id]: aiSuggestions } });
}

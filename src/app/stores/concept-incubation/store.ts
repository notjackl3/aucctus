import { Lens, lens } from '@dhmk/zustand-lens';
import { IncubationAnswer } from '@libs/api/concepts';
import {
  IClarifyingQuestion,
  IConceptIncubationQuestionnaireSection,
  IGeneratedConcept,
} from '@libs/api/types';
import type { IAppStore } from '../store';
import {
  AnswerItem,
  IConceptIncubationActions,
  IncubationAISuggestions,
  resetQuestionnaire,
  setActiveClarifyingQuestion,
  setActiveGeneratedConcept,
  setActiveQuestionnaire,
  setClarifyingQuestions,
  setCurrentMultiSelectAnswerList,
  setCurrentQuestionOrder,
  setCurrentTextAnswerList,
  setDraftSeedUuid,
  setIsClonedSeed,
  setIsNewSeed,
  setSubmittedAnswers,
  setSuggestions,
} from './actions';

export interface IConceptIncubationState extends IConceptIncubationActions {
  status: 'pre-generation' | 'generating' | 'selecting' | 'post-generation';

  currentQuestionOrder?: number;
  isNewSeed: boolean;
  isClonedSeed: boolean;
  activeQuestionnaire?: IConceptIncubationQuestionnaireSection;
  draftSeedUuid: string;
  currentTextAnswerList: AnswerItem[];
  currentMultiSelectAnswerList: AnswerItem[];
  submittedAnswers: IncubationAnswer[];
  clarifyingQuestions: IClarifyingQuestion[];
  activeClarifyingQuestion: IClarifyingQuestion | undefined;
  suggestions: IncubationAISuggestions;
  activeGeneratedConcept: IGeneratedConcept | undefined;
}

// Export initial state for use in store and reset functionality
export const initialIncubationState = {
  status: 'pre-generation' as
    | 'pre-generation'
    | 'generating'
    | 'selecting'
    | 'post-generation',
  isNewSeed: true,
  currentQuestionOrder: undefined as number | undefined,
  isClonedSeed: false,
  activeQuestionnaire: undefined as
    | IConceptIncubationQuestionnaireSection
    | undefined,
  activeClarifyingQuestion: undefined as IClarifyingQuestion | undefined,
  draftSeedUuid: '',
  currentTextAnswerList: [] as AnswerItem[],
  currentMultiSelectAnswerList: [] as AnswerItem[],
  submittedAnswers: [] as IncubationAnswer[],
  clarifyingQuestions: [] as IClarifyingQuestion[],
  activeGeneratedConcept: undefined as IGeneratedConcept | undefined,
  suggestions: {} as IncubationAISuggestions,
};

const conceptIncubationSlice: Lens<IConceptIncubationState, IAppStore> = (
  set,
  get,
  storeApi,
) => {
  const actionContext = { set, get, storeApi };

  return {
    // State
    ...initialIncubationState,

    // Actions
    setCurrentQuestionOrder: setCurrentQuestionOrder.bind(actionContext),
    setActiveQuestionnaire: setActiveQuestionnaire.bind(actionContext),
    setIsNewSeed: setIsNewSeed.bind(actionContext),
    setIsClonedSeed: setIsClonedSeed.bind(actionContext),
    setDraftSeedUuid: setDraftSeedUuid.bind(actionContext),
    setCurrentTextAnswerList: setCurrentTextAnswerList.bind(actionContext),
    setCurrentMultiSelectAnswerList:
      setCurrentMultiSelectAnswerList.bind(actionContext),
    setSubmittedAnswers: setSubmittedAnswers.bind(actionContext),
    setClarifyingQuestions: setClarifyingQuestions.bind(actionContext),
    resetQuestionnaire: resetQuestionnaire.bind(actionContext),
    setSuggestions: setSuggestions.bind(actionContext),
    setActiveClarifyingQuestion:
      setActiveClarifyingQuestion.bind(actionContext),
    setActiveGeneratedConcept: setActiveGeneratedConcept.bind(actionContext),
  };
};

export default lens<IConceptIncubationState, IAppStore>(conceptIncubationSlice);

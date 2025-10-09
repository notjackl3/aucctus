import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';
import { INucleusAnswerActions, INucleusAnswerProgressState } from './actions';

export interface INucleusAnswerState extends INucleusAnswerActions {
  // Map of question UUID to progress state
  answerProgressByQuestion: Record<string, INucleusAnswerProgressState>;
}

const nucleusAnswerSlice: Lens<INucleusAnswerState, IAppStore> = (set, get) => {
  return {
    answerProgressByQuestion: {},

    setAnswerProgress: (questionUuid, stage, message, progress) => {
      const currentState = get();
      set({
        ...currentState,
        answerProgressByQuestion: {
          ...currentState.answerProgressByQuestion,
          [questionUuid]: {
            questionUuid,
            stage,
            message,
            progress,
            timestamp: Date.now(),
          },
        },
      });
    },

    clearAnswerProgress: (questionUuid) => {
      const currentState = get();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [questionUuid]: _removed, ...rest } =
        currentState.answerProgressByQuestion;
      set({
        ...currentState,
        answerProgressByQuestion: rest,
      });
    },

    clearAllAnswerProgress: () => {
      const currentState = get();
      set({
        ...currentState,
        answerProgressByQuestion: {},
      });
    },

    getAnswerProgress: (questionUuid) => {
      const currentState = get();
      return currentState.answerProgressByQuestion[questionUuid];
    },
  };
};

export default lens<INucleusAnswerState, IAppStore>(nucleusAnswerSlice);

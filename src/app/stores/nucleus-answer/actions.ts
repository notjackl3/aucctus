export interface INucleusAnswerProgressState {
  questionUuid: string;
  stage: 'started' | 'researching' | 'extracting' | 'generating' | 'completed';
  message: string;
  progress?: number;
  timestamp: number;
  answerText: string;
  sectionType: string;
}

export interface INucleusAnswerActions {
  setAnswerProgress: (
    questionUuid: string,
    stage: INucleusAnswerProgressState['stage'],
    message: string,
    progress?: number,
    answerText?: string,
    sectionType?: string,
  ) => void;
  clearAnswerProgress: (questionUuid: string) => void;
  clearAllAnswerProgress: () => void;
  getAnswerProgress: (
    questionUuid: string,
  ) => INucleusAnswerProgressState | undefined;
}

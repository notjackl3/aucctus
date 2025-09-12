// ExpandedCategoryView component fixtures for UI text and labels

export interface ExpandedCategoryViewUIText {
  headers: {
    researchQuestions: string;
    answers: string;
    coreQuestions: string;
    deeperResearch: string;
  };
  buttons: {
    addNewAssumption: string;
    addNewAnswer: string;
    addingNewAnswer: string;
    generateAiAnswer: string;
  };
  placeholders: {
    noQuestionsAvailable: string;
    selectQuestionToView: string;
    questionNotAnswered: string;
    enterAnswerHere: string;
    sourceExample: string;
  };
  toggles: {
    includeInContext: string;
  };
  forms: {
    answerContent: {
      placeholder: string;
    };
    sourceField: {
      placeholder: string;
    };
  };
}

export const expandedCategoryViewUIText: ExpandedCategoryViewUIText = {
  headers: {
    researchQuestions: 'Research Questions',
    answers: 'Answers',
    coreQuestions: 'Core Questions',
    deeperResearch: 'Deeper Research',
  },
  buttons: {
    addNewAssumption: 'Add new assumption',
    addNewAnswer: 'Add new answer',
    addingNewAnswer: 'Adding new answer',
    generateAiAnswer: 'Generate AI Answer',
  },
  placeholders: {
    noQuestionsAvailable: 'No core questions available yet.',
    selectQuestionToView: 'Select a question to view details',
    questionNotAnswered:
      "Our agents weren't able to find external sources to reliably answer this question.",
    enterAnswerHere: 'Enter your answer here...',
    sourceExample: 'Source (e.g., Internal Report)',
  },
  toggles: {
    includeInContext: 'Include in agent context',
  },
  forms: {
    answerContent: {
      placeholder: 'Enter your answer here...',
    },
    sourceField: {
      placeholder: 'Source (e.g., Internal Report)',
    },
  },
};

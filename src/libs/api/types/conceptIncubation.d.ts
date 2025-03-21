interface IAISuggestionsContext {
  seedUuid: string;
  questionId: int; // The question Identifier(And Strict Typing to this)
  userUuid: string;
}

interface IAISuggestionList {
  suggestions: IAISuggestion[];
}

export interface IAISuggestion {
  title: string;
  description: string;
}

interface IConceptGenerationContext {
  seedUuid: string;
  accountUuid: string;
  userUuid: string;
}

interface IGeneratedConceptList {
  concepts: IGeneratedConcept[];
}

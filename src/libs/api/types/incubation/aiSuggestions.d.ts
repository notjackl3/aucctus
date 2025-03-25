export interface IAISuggestionsContext {
  seedUuid: string;
  questionId: int; // The question Identifier(And Strict Typing to this)
  userUuid: string;
}

export interface IAISuggestionList {
  suggestions: IAISuggestion[];
}

export interface IAISuggestion {
  title: string;
  description: string;
}

export interface IConceptGenerationContext {
  seedUuid: string;
  accountUuid: string;
  userUuid: string;
}

export interface IGeneratedConceptList {
  concepts: IGeneratedConcept[];
}

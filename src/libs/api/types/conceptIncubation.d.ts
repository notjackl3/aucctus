interface IAISuggestionsContext {
  seed_uuid: string;
  identifier: string; // The question Identifier(And Strict Typing to this)
  user_uuid: string;
}

interface IAISuggestionList {
  suggestions: IAISuggestion[];
}

interface IAISuggestion {
  title: string;
  description: string;
}

interface IConceptGenerationContext {
  seed_uuid: string;
  account_uuid: string;
  user_uuid: string;
}

interface IConceptList {
  concepts: IConcept[];
}

export interface IConcept {
  title?: string;
  description?: string;
  uuid: string;
}

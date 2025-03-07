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

export interface AiSuggestionEventDetail {
  questionId: number;
  answer: string[];
}

export class AiSuggestionEvent extends CustomEvent<AiSuggestionEventDetail> {
  static readonly eventName = 'aucctus-generate-ai-suggestions';

  constructor(detail: AiSuggestionEventDetail) {
    super(AiSuggestionEvent.eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });
  }

  static dispatch(detail: AiSuggestionEventDetail): void {
    const event = new AiSuggestionEvent(detail);
    window.dispatchEvent(event);
  }
}

// Type declaration for the event
declare global {
  interface WindowEventMap {
    [AiSuggestionEvent.eventName]: AiSuggestionEvent;
  }
}

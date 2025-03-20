export interface IncubationAnswerEventDetail {
  answer: string;
}

export class IncubationAnswerEvent extends CustomEvent<IncubationAnswerEventDetail> {
  static readonly eventName = 'aucctus-incubation-answer-update';

  constructor(detail: IncubationAnswerEventDetail) {
    super(IncubationAnswerEvent.eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });
  }

  static dispatch(detail: IncubationAnswerEventDetail): void {
    const event = new IncubationAnswerEvent(detail);
    window.dispatchEvent(event);
  }
}

// Type declaration for the event
declare global {
  interface WindowEventMap {
    [IncubationAnswerEvent.eventName]: IncubationAnswerEvent;
  }
}

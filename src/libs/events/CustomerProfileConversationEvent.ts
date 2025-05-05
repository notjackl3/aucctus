export interface CustomerProfileConversationEventDetail {
  sessionId: string;
}

export class CustomerProfileConversationEvent extends CustomEvent<CustomerProfileConversationEventDetail> {
  static readonly eventName = 'customer-profile-new-conversation';

  constructor(detail: CustomerProfileConversationEventDetail) {
    super(CustomerProfileConversationEvent.eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });
  }

  static dispatch(detail: CustomerProfileConversationEventDetail): void {
    const event = new CustomerProfileConversationEvent(detail);
    window.dispatchEvent(event);
  }
}

// Type declaration for the event
declare global {
  interface WindowEventMap {
    [CustomerProfileConversationEvent.eventName]: CustomerProfileConversationEvent;
  }
}

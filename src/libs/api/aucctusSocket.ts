import { SocketService } from './base';

export class AucctusSocket extends SocketService {
  protected onError(error: Event): void {
    console.log('AucctusSocket encountered an error:', error);
  }
  protected handleMessage(event: SocketEvent): void {
    console.log('Received event:', event);
  }
  protected onConnect(): void {
    console.log('AucctusSocket connected.');
    // Optionally, send an initial message or request state.
  }

  protected onConnectError(err: any): void {
    console.error('AucctusSocket connection error:', err);
  }

  protected onDisconnect(reason: string): void {
    console.log('AucctusSocket disconnected:', reason);
  }

  protected handleChatMessage(event: SocketEvent): void {
    // Process a chat message event (e.g. update UI).
    console.log('Received chat message:', event);
  }

  protected handleNotification(event: SocketEvent): void {
    // Process a notification event.
    console.log('Received notification:', event);
  }

  protected handleError(event: SocketEvent): void {
    // Process an error event.
    console.error('Received error event:', event);
  }

  // Domain-specific method for sending chat messages.
  public sendChatMessage(message: string): void {
    // When sending, include the "type" key so the Django consumer can route the event.
    const eventPayload = JSON.stringify({ type: 'chat.message', message });
    this.send(eventPayload);
  }
}

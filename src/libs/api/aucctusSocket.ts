import analytics from '@libs/telemetry';
import { SocketService } from './base';

export class AucctusSocket extends SocketService {
  protected onError(error: Event): void {
    analytics.debug('AucctusSocket encountered an error:', error);
  }
  protected handleMessage(event: SocketEvent): void {
    analytics.debug('Received event:', event);
  }
  protected onConnect(): void {
    analytics.debug('AucctusSocket connected.');
    // Optionally, send an initial message or request state.
  }

  protected onConnectError(err: any): void {
    analytics.error('AucctusSocket connection error:', err);
  }

  protected onDisconnect(reason: string): void {
    analytics.debug('AucctusSocket disconnected:', reason);
  }

  protected handleChatMessage(event: SocketEvent): void {
    // Process a chat message event (e.g. update UI).
    analytics.debug('Received chat message:', event);
  }

  protected handleNotification(event: SocketEvent): void {
    // Process a notification event.
    analytics.debug('Received notification:', event);
  }

  protected handleError(event: SocketEvent): void {
    // Process an error event.
    analytics.error('Received error event:', event);
  }

  // Domain-specific method for sending chat messages.
  public sendChatMessage(message: string): void {
    // When sending, include the "type" key so the Django consumer can route the event.
    const eventPayload = JSON.stringify({ type: 'chat.message', message });
    this.send(eventPayload);
  }

  protected onMaxRetriesExceeded(error: Error): void {
    analytics.debug('Max reconnect attempts exceeded:', error);
    // You can now hook into this error and respond dynamically,
    // for example, by showing a notification or logging the user out.
    // Optionally, throw the error to trigger higher-level error handling.
  }
}

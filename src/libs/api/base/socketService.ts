import analytics from '../../analytics';
import { Api } from '../api';

export interface ISocketConfig {
  baseUrl: string; // e.g. "ws://localhost:8000/ws/endpoint/"
  autoConnect?: boolean; // if false, you must call connect() manually
  reconnectInterval?: number; // milliseconds to wait before reconnecting
  debug?: boolean;
}

/**
 * SocketService is designed similar to your APIService.
 * It receives the auth token from the API instance and manages the connection.
 * Additionally, it sets up a generic "message" handler to parse incoming JSON events
 * that include a "type" key, allowing you to dispatch handling based on event type.
 */
export abstract class SocketService {
  protected _ws: WebSocket | null = null;
  protected _accessToken?: string;
  protected config: ISocketConfig;
  protected reconnectInterval: number;
  protected shouldReconnect: boolean = true;

  constructor(
    protected api: Api,
    config: ISocketConfig,
  ) {
    this._accessToken = api.accessToken;
    this.config = config;
    this.reconnectInterval = config.reconnectInterval ?? 3000;
  }

  get ws() {
    return this._ws;
  }

  public connect(): void {
    if (!this._accessToken) {
      return;
    }

    // Build the URL by appending the token as a query parameter.
    const urlObj = new URL(this.config.baseUrl);

    // urlObj.searchParams.append('token', this._accessToken);
    const url = urlObj.toString();

    // Create the WebSocket connection.
    this._ws = new WebSocket(url);

    this._ws.onopen = (event: Event) => {
      if (this.config.debug) {
        analytics.debug('WebSocket connected', event);
      }
      this.onConnect();
    };

    this._ws.onmessage = (messageEvent: MessageEvent) => {
      try {
        const data: SocketEvent = JSON.parse(messageEvent.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing incoming message', error);
      }
    };

    this._ws.onerror = (error: Event) => {
      analytics.error('WebSocket encountered an error', error);
      this.onError(error);
    };

    this._ws.onclose = (closeEvent: CloseEvent) => {
      if (this.config.debug) {
        analytics.debug('WebSocket closed:', closeEvent.reason);
      }
      this.onDisconnect(closeEvent.reason);
      // Attempt to reconnect after a delay if allowed.
      if (this.shouldReconnect) {
        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval);
      }
    };
  }

  public disconnect(): void {
    // Prevent automatic reconnection.
    this.shouldReconnect = false;
    this._ws?.close();
  }

  // Send data as a JSON string.
  public send(data: SocketEvent | string): void {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this._ws.send(payload);
    } else {
      analytics.debug('WebSocket is not open; cannot send data');
    }
  }

  // When the API instance updates its token, update our connection.
  public set accessToken(token: string | undefined) {
    this._accessToken = token;
    // Close the current connection so that reconnect uses the new token.
    this._ws?.close();

    if (token) {
      this.connect();
    }
  }

  public get accessToken() {
    return this._accessToken;
  }

  // Abstract hooks to be implemented by subclasses.
  protected abstract onConnect(): void;
  protected abstract onError(error: Event): void;
  protected abstract onDisconnect(reason: string): void;
  protected abstract handleMessage(event: SocketEvent): void;
}

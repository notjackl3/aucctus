import analytics from '../../analytics';
import { Api } from '../api';

export interface ISocketConfig {
  baseUrl: string; // e.g. "ws://localhost:8000/ws/endpoint/"
  autoConnect?: boolean; // if false, you must call connect() manually
  reconnectInterval?: number; // milliseconds to wait before reconnecting
  debug?: boolean;
  maxRetries?: number; // maximum number of reconnect attempts before giving up
}

export interface BaseSocketEvent {
  type: string;
  [key: string]: any;
}

export type SocketEvent = BaseSocketEvent;

export abstract class SocketService {
  protected _ws: WebSocket | null = null;
  protected _accessToken?: string;
  protected config: ISocketConfig;
  protected reconnectInterval: number;
  protected shouldReconnect: boolean = true;
  protected currentRetryCount: number = 0;

  // Listeners for when max retries are exceeded
  protected maxRetriesExceededListeners: Array<(error: Error) => void> = [];

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
    urlObj.searchParams.append('token', this._accessToken);
    const url = urlObj.toString();

    // Create the WebSocket connection.
    this._ws = new WebSocket(url);

    this._ws.onopen = (event: Event) => {
      if (this.config.debug) {
        analytics.debug('WebSocket connected', event);
      }
      // Reset retry count on successful connection.
      this.currentRetryCount = 0;
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
      if (this.shouldReconnect) {
        if (
          this.config.maxRetries !== undefined &&
          this.currentRetryCount >= this.config.maxRetries
        ) {
          // Maximum retry limit reached—notify all listeners.
          const error = new Error(
            `Max reconnect attempts (${this.config.maxRetries}) reached`,
          );
          this.maxRetriesExceededListeners.forEach((listener) =>
            listener(error),
          );
        } else {
          this.currentRetryCount++;
          setTimeout(() => {
            this.connect();
          }, this.reconnectInterval);
        }
      }
    };
  }

  public disconnect(): void {
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

  public set accessToken(token: string | undefined) {
    this._accessToken = token;
    this._ws?.close();
    if (token) {
      this.connect();
    }
  }

  public get accessToken() {
    return this._accessToken;
  }

  // Listener registration methods for max retries exceeded.
  public addMaxRetriesExceededListener(listener: (error: Error) => void): void {
    this.maxRetriesExceededListeners.push(listener);
  }

  public removeMaxRetriesExceededListener(
    listener: (error: Error) => void,
  ): void {
    this.maxRetriesExceededListeners = this.maxRetriesExceededListeners.filter(
      (l) => l !== listener,
    );
  }

  // Abstract hooks to be implemented by subclasses.
  protected abstract onConnect(): void;
  protected abstract onError(error: Event): void;
  protected abstract onDisconnect(reason: string): void;
  protected abstract handleMessage(event: SocketEvent): void;
}

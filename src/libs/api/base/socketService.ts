import analytics from '../../telemetry';
import { Api } from '../api';
import { OutboundSocketEvent } from '../types';

export interface ISocketConfig {
  baseUrl: string; // e.g. "ws://localhost:8000/ws/endpoint/"
  autoConnect?: boolean; // if false, you must call connect() manually
  reconnectInterval?: number; // milliseconds to wait before reconnecting
  debug?: boolean;
  maxRetries?: number; // maximum number of reconnect attempts before giving up
}

export class SocketService {
  protected _ws: WebSocket | null = null;
  protected _accessToken?: string;
  protected config: ISocketConfig & { maxRetries: number };
  protected reconnectInterval: number;
  protected shouldReconnect: boolean = true;
  protected currentRetryCount: number = 0;
  protected deferredConnect: Promise<void> | undefined;
  protected _isConnected: boolean = false;

  // Listeners for when max retries are exceeded
  protected maxRetriesExceededListeners: Array<(error: Error) => void> = [];

  constructor(
    protected api: Api,
    config: ISocketConfig,
  ) {
    this._accessToken = api.accessToken;
    // Default max retries to 5 if not provided
    this.config = Object.assign({ maxRetries: 5 }, config);
    this.reconnectInterval = config.reconnectInterval ?? 3000;
    this._isConnected = false;
  }

  get ws() {
    return this._ws;
  }

  get isConnected() {
    return this._isConnected;
  }

  public async connect(): Promise<void> {
    this.shouldReconnect = true;
    if (!this._accessToken || this._isConnected) {
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
      this._isConnected = true;
      // Reset retry count on successful connection.
      this.currentRetryCount = 0;
    };

    this._ws.onerror = (error: Event) => {
      analytics.error('WebSocket encountered an error', error);
    };

    this._ws.onclose = (closeEvent: CloseEvent) => {
      if (this.config.debug) {
        analytics.debug('WebSocket closed:', closeEvent.reason);
      }

      this._isConnected = false;
      if (this.shouldReconnect) {
        if (this.currentRetryCount >= this.config.maxRetries) {
          // Maximum retry limit reached—notify all listeners.
          const error = new Error(
            `Max reconnect attempts (${this.config.maxRetries}) reached`,
          );
          this.maxRetriesExceededListeners.forEach((listener) =>
            listener(error),
          );
        } else {
          this.currentRetryCount++;
          setTimeout(async () => {
            if (this.deferredConnect) {
              await this.deferredConnect;
            }
            this.deferredConnect = this.connect();
            await this.deferredConnect;
          }, this.reconnectInterval);
        }
      }
    };
  }

  public async disconnect(): Promise<void> {
    if (this.deferredConnect) {
      await this.deferredConnect;
    }

    this.shouldReconnect = false;
    this._isConnected = false;

    this._ws?.close();
  }

  // Send data as a JSON string.
  public send(data: OutboundSocketEvent | string): void {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this._ws.send(payload);
    } else {
      analytics.debug('WebSocket is not open; cannot send data');
    }
  }

  public set accessToken(token: string | undefined) {
    this._accessToken = token;
    (async () => {
      if (this.deferredConnect) {
        await this.deferredConnect;
      }

      if (this._ws?.readyState === WebSocket.OPEN) {
        this._ws?.close();
      }

      if (token) {
        this.deferredConnect = this.connect();
        await this.deferredConnect;
      }
    })();
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
}

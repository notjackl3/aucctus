import analytics from '../../telemetry';
import { Api } from '../api';
import { OutboundSocketEvent } from '../types';

// WebSocket close codes
export enum WebSocketCloseCode {
  // Standard WebSocket close codes
  NORMAL_CLOSURE = 1000, // Normal closure; the connection successfully completed
  GOING_AWAY = 1001, // Server going away or client leaves (browser tab closing)
  PROTOCOL_ERROR = 1002, // Protocol error
  UNSUPPORTED_DATA = 1003, // Unsupported data
  RESERVED = 1004, // Reserved
  NO_STATUS = 1005, // No status received
  ABNORMAL_CLOSURE = 1006, // Abnormal closure, no close frame sent
  INVALID_PAYLOAD = 1007, // Invalid frame payload data
  POLICY_VIOLATION = 1008, // Policy violation
  MESSAGE_TOO_BIG = 1009, // Message too big
  MANDATORY_EXTENSION = 1010, // Client expected server to negotiate extension
  INTERNAL_ERROR = 1011, // Server encountered an internal error
  SERVICE_RESTART = 1012, // Server is restarting
  TRY_AGAIN_LATER = 1013, // Try again later
  BAD_GATEWAY = 1014, // Server acting as gateway received invalid response
  TLS_HANDSHAKE_FAIL = 1015, // TLS handshake failure

  // Aucctus custom authentication close codes
  NO_AUTHENTICATION = 4001, // User is not authenticated
  NO_ACCOUNT = 4002, // Authenticated user doesn't have an account
  INVALID_TOKEN = 4003, // Invalid authentication token provided

  // Server-related close codes
  SERVER_SHUTDOWN = 1001, // Alias for GOING_AWAY, used when server is shutting down
}

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

  // Authentication event listeners
  protected authErrorListeners: Array<
    (code: WebSocketCloseCode, reason: string) => Promise<boolean>
  > = [];

  constructor(
    protected api: Api,
    config: ISocketConfig,
  ) {
    this._accessToken = api.accessToken;
    // Default max retries to 5 if not provided
    this.config = Object.assign({ maxRetries: 5 }, config);
    this.reconnectInterval = config.reconnectInterval ?? 3000;
    this._isConnected = false;

    this.addAuthErrorListener(this._handleRefreshToken);
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

  public get ws() {
    return this._ws;
  }

  public get isConnected() {
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
      if (this._isConnected) {
        return;
      }

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

    this._ws.onclose = async (closeEvent: CloseEvent) => {
      if (this._ws?.readyState === WebSocket.CLOSED || !this._isConnected) {
        return;
      }

      if (this.config.debug) {
        analytics.debug(
          'WebSocket closed:',
          closeEvent.code,
          closeEvent.reason,
        );
      }

      this._isConnected = false;

      // Handle specific close codes
      let shouldAttemptReconnect = this.shouldReconnect;

      switch (closeEvent.code) {
        case WebSocketCloseCode.NORMAL_CLOSURE:
          // Normal closure, don't reconnect unless explicitly required
          shouldAttemptReconnect = false;
          break;

        case WebSocketCloseCode.NO_AUTHENTICATION:
        case WebSocketCloseCode.INVALID_TOKEN:
        case WebSocketCloseCode.POLICY_VIOLATION: // Often used for auth issues
          // Handle authentication errors
          shouldAttemptReconnect = await this.handleAuthenticationError(
            closeEvent.code as WebSocketCloseCode,
            closeEvent.reason,
          );
          break;

        // Handle other specific codes as needed
        case WebSocketCloseCode.INTERNAL_ERROR:
          analytics.error(
            'WebSocket closed due to server internal error',
            closeEvent,
          );

          break;

        default:
          // Default behavior for unhandled codes
          break;
      }

      if (shouldAttemptReconnect) {
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

  /**
   * Handles authentication errors by notifying registered auth error listeners
   * @param code The WebSocket close code
   * @param reason The reason for closure
   * @returns Promise<boolean> indicating if reconnection should be attempted
   */
  protected async handleAuthenticationError(
    code: WebSocketCloseCode,
    reason: string,
  ): Promise<boolean> {
    // If there are no auth error listeners, don't reconnect
    if (this.authErrorListeners.length === 0) {
      analytics.error('Authentication error but no handlers registered', {
        code,
        reason,
      });
      return false;
    }

    // Call all auth error listeners and check if any of them handled the error successfully
    for (const listener of this.authErrorListeners) {
      try {
        const shouldReconnect = await listener(code, reason);
        if (shouldReconnect) {
          // If any listener indicates we should reconnect, return true
          return true;
        }
      } catch (error) {
        analytics.error('Error in auth error listener', error);
      }
    }

    // If no listener successfully handled the error, don't reconnect
    return false;
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

  private async _handleRefreshToken(code: WebSocketCloseCode) {
    if (
      [
        WebSocketCloseCode.INVALID_TOKEN,
        WebSocketCloseCode.NO_AUTHENTICATION,
        WebSocketCloseCode.POLICY_VIOLATION,
      ].includes(code)
    ) {
      try {
        // Attempt to refresh the token
        if (this.api.pendingRefresh) {
          await this.api.pendingRefresh;
        } else {
          await this.api.refreshToken();
        }
        return true;
      } catch (error) {
        analytics.error('Failed to refresh token', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Register an authentication error handler to process token refresh logic
   * @param listener Function that receives the close code and reason and returns whether to attempt reconnection
   */
  public addAuthErrorListener(
    listener: (code: WebSocketCloseCode, reason: string) => Promise<boolean>,
  ): void {
    this.authErrorListeners.push(listener);
  }

  /**
   * Remove an authentication error handler
   */
  public removeAuthErrorListener(
    listener: (code: WebSocketCloseCode, reason: string) => Promise<boolean>,
  ): void {
    this.authErrorListeners = this.authErrorListeners.filter(
      (l) => l !== listener,
    );
  }
}

import analytics from '../../telemetry';
import telemetry from '../../telemetry';
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

  // WebSocket instance change listeners for React hooks
  protected wsInstanceChangeListeners: Array<(ws: WebSocket | null) => void> =
    [];

  // Central message dispatcher: event type → set of handlers
  // Parses each message once and dispatches to matching handlers
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private boundMessageHandler: ((e: MessageEvent) => void) | null = null;

  constructor(
    protected api: Api,
    config: ISocketConfig,
  ) {
    // Legacy JWT token support maintained for backward compatibility
    // Primary authentication now uses Clerk tokens via api.getToken()
    this._accessToken = undefined;
    // Default max retries to 5 if not provided
    this.config = Object.assign({ maxRetries: 5 }, config);
    this.reconnectInterval = config.reconnectInterval ?? 3000;
    this._isConnected = false;

    this.addAuthErrorListener(this._handleRefreshToken);

    // Log socket service initialization
    telemetry.log('websocket.service.initialized', {
      baseUrl: config.baseUrl,
      autoConnect: config.autoConnect,
      maxRetries: this.config.maxRetries,
      reconnectInterval: this.reconnectInterval,
    });
  }

  public set accessToken(token: string | undefined) {
    if (token === this._accessToken) {
      return;
    }

    const previousToken = this._accessToken;
    const previousConnectionState = this._isConnected;
    this._accessToken = token;

    // Log token update
    telemetry.log('websocket.token.updated', {
      hadPreviousToken: !!previousToken,
      hasNewToken: !!token,
      wasConnected: previousConnectionState,
      willReconnect:
        !!token && (!this._ws || this._ws.readyState === WebSocket.CLOSED),
      willDisconnect: !token && this._ws?.readyState === WebSocket.OPEN,
    });

    (async () => {
      if (this.deferredConnect) {
        await this.deferredConnect;
      }

      if (this._ws?.readyState === WebSocket.OPEN) {
        telemetry.log('websocket.token.change.closing_existing', {
          baseUrl: this.config.baseUrl,
          hadToken: !!previousToken,
          hasNewToken: !!token,
        });
        this._ws.close();
      } else if (
        token &&
        (!this._ws || this._ws.readyState === WebSocket.CLOSED)
      ) {
        telemetry.log('websocket.token.change.connecting', {
          baseUrl: this.config.baseUrl,
          previousState: this._ws?.readyState,
        });
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

    // Add guard against duplicate connection attempts
    if (this._isConnected) {
      telemetry.log('websocket.connection.attempt.already_connected', {
        baseUrl: this.config.baseUrl,
        retryCount: this.currentRetryCount,
      });
      return;
    }

    // Get Clerk token from API instance
    let clerkToken: string | undefined;
    try {
      clerkToken = await this.api.getToken();
    } catch (error) {
      analytics.error('Failed to get Clerk token for WebSocket', error);
    }

    // Use Clerk token if available, otherwise fall back to legacy token
    const tokenToUse = clerkToken || this._accessToken;

    if (!tokenToUse) {
      telemetry.log('websocket.connection.attempt.no_token', {
        baseUrl: this.config.baseUrl,
        retryCount: this.currentRetryCount,
        hasClerkToken: !!clerkToken,
        hasLegacyToken: !!this._accessToken,
      });
      return;
    }

    // Log connection attempt
    telemetry.log('websocket.connection.attempt', {
      baseUrl: this.config.baseUrl,
      retryCount: this.currentRetryCount,
      maxRetries: this.config.maxRetries,
      hasToken: !!tokenToUse,
      tokenType: clerkToken ? 'clerk' : 'legacy',
    });

    // Build the URL by appending the token as a query parameter.
    const urlObj = new URL(this.config.baseUrl);
    urlObj.searchParams.append('token', tokenToUse);
    const url = urlObj.toString();

    // Create the WebSocket connection.
    this._ws = new WebSocket(url);

    this._ws.onopen = (event: Event) => {
      if (this._isConnected) {
        telemetry.log('websocket.connection.onopen.already_connected', {
          baseUrl: this.config.baseUrl,
        });
        return;
      }

      if (this.config.debug) {
        analytics.debug('WebSocket connected', event);
      }

      this._isConnected = true;
      // Reset retry count on successful connection.
      this.currentRetryCount = 0;

      // Attach central message dispatcher for subscribe/unsubscribe pattern
      this.attachMessageDispatcher();

      // Log successful connection
      telemetry.log('websocket.connection.established', {
        baseUrl: this.config.baseUrl,
        retryCount: this.currentRetryCount,
        readyState: this._ws?.readyState,
      });

      this.notifyWsInstanceChange();
    };

    this._ws.onerror = (error: Event) => {
      analytics.error('WebSocket encountered an error', error);

      // Log websocket error
      telemetry.log('websocket.connection.error', {
        baseUrl: this.config.baseUrl,
        retryCount: this.currentRetryCount,
        isConnected: this._isConnected,
        readyState: this._ws?.readyState,
        error: error.type || 'unknown_error',
      });
    };

    this._ws.onclose = async (closeEvent: CloseEvent) => {
      if (!this._isConnected) {
        telemetry.log('websocket.connection.onclose.not_connected', {
          baseUrl: this.config.baseUrl,
          code: closeEvent.code,
          reason: closeEvent.reason,
        });
        return;
      }

      if (this.config.debug) {
        analytics.debug(
          'WebSocket closed:',
          closeEvent.code,
          closeEvent.reason,
        );
      }

      // Log connection closed
      telemetry.log('websocket.connection.closed', {
        baseUrl: this.config.baseUrl,
        code: closeEvent.code,
        reason: closeEvent.reason,
        wasClean: closeEvent.wasClean,
        retryCount: this.currentRetryCount,
        readyState: this._ws?.readyState,
      });

      this._isConnected = false;

      // Detach central message dispatcher before nulling the WebSocket
      this.detachMessageDispatcher();
      this._ws = null;

      // Notify listeners that WebSocket instance changed (now null)
      this.notifyWsInstanceChange();

      // Handle specific close codes
      let shouldAttemptReconnect = this.shouldReconnect;

      switch (closeEvent.code) {
        case WebSocketCloseCode.NORMAL_CLOSURE:
          // Normal closure, don't reconnect unless explicitly required
          shouldAttemptReconnect = false;
          telemetry.log('websocket.connection.normal_closure', {
            baseUrl: this.config.baseUrl,
          });
          break;

        case WebSocketCloseCode.NO_AUTHENTICATION:
        case WebSocketCloseCode.INVALID_TOKEN:
        case WebSocketCloseCode.POLICY_VIOLATION: // Often used for auth issues
          // Log authentication error
          telemetry.log('websocket.authentication.error', {
            code: closeEvent.code,
            reason: closeEvent.reason,
            retryCount: this.currentRetryCount,
          });

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

          // Log server error
          telemetry.log('websocket.server.error', {
            code: closeEvent.code,
            reason: closeEvent.reason,
            retryCount: this.currentRetryCount,
          });

          break;

        default:
          // Default behavior for unhandled codes
          // Log unknown close code
          telemetry.log('websocket.connection.closed.unknown', {
            code: closeEvent.code,
            reason: closeEvent.reason,
            retryCount: this.currentRetryCount,
          });
          break;
      }

      if (shouldAttemptReconnect) {
        if (this.currentRetryCount >= this.config.maxRetries) {
          // Maximum retry limit reached—notify all listeners.
          const error = new Error(
            `Max reconnect attempts (${this.config.maxRetries}) reached`,
          );

          // Log max retries exceeded
          telemetry.log('websocket.reconnect.max_retries_exceeded', {
            baseUrl: this.config.baseUrl,
            maxRetries: this.config.maxRetries,
            finalCloseCode: closeEvent.code,
            finalCloseReason: closeEvent.reason,
          });

          this.maxRetriesExceededListeners.forEach((listener) =>
            listener(error),
          );
        } else {
          this.currentRetryCount++;

          // Log reconnection attempt
          telemetry.log('websocket.reconnect.scheduled', {
            baseUrl: this.config.baseUrl,
            retryCount: this.currentRetryCount,
            maxRetries: this.config.maxRetries,
            delayMs: this.reconnectInterval,
          });

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

      // Log no auth handlers
      telemetry.log('websocket.authentication.no_handlers', {
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
          // Log successful auth recovery
          telemetry.log('websocket.authentication.recovery.success', {
            code,
            reason,
          });
          // If any listener indicates we should reconnect, return true
          return true;
        }
      } catch (error) {
        analytics.error('Error in auth error listener', error);

        // Log auth recovery failure
        telemetry.log('websocket.authentication.recovery.error', {
          code,
          reason,
          error: error instanceof Error ? error.message : 'unknown_error',
        });
      }
    }

    // If no listener successfully handled the error, don't reconnect
    telemetry.log('websocket.authentication.recovery.failed', {
      code,
      reason,
    });

    return false;
  }

  public async disconnect(): Promise<void> {
    if (this.deferredConnect) {
      await this.deferredConnect;
    }

    this.shouldReconnect = false;
    // Log manual disconnect with correct state before changing it
    telemetry.log('websocket.connection.disconnect', {
      baseUrl: this.config.baseUrl,
      wasConnected: this._isConnected,
    });

    this._isConnected = false;
    this._ws?.close();
  }

  // Send data as a JSON string.
  public send(data: OutboundSocketEvent | string): void {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this._ws.send(payload);

      // Log message sent
      telemetry.log('websocket.message.sent', {
        baseUrl: this.config.baseUrl,
        messageType:
          typeof data === 'string' ? 'string' : (data as any).type || 'unknown',
        payloadSize: payload.length,
      });
    } else {
      // Determine the specific reason for send failure
      const wsState = this._ws?.readyState;
      let failureReason = 'unknown';
      let stateDescription = 'unknown';

      if (!this._ws) {
        failureReason = 'no_websocket_instance';
        stateDescription = 'WebSocket instance is null';
      } else {
        switch (wsState) {
          case WebSocket.CONNECTING:
            failureReason = 'still_connecting';
            stateDescription = 'WebSocket is still connecting';
            break;
          case WebSocket.CLOSING:
            failureReason = 'closing';
            stateDescription = 'WebSocket is closing';
            break;
          case WebSocket.CLOSED:
            failureReason = 'closed';
            stateDescription = 'WebSocket is closed';
            break;
          default:
            failureReason = 'invalid_state';
            stateDescription = `Unknown WebSocket state: ${wsState}`;
        }
      }

      // Log detailed send failure information
      telemetry.log('websocket.message.send_failed', {
        baseUrl: this.config.baseUrl,
        readyState: wsState,
        isConnected: this._isConnected,
        messageType:
          typeof data === 'string' ? 'string' : (data as any).type || 'unknown',
        failureReason,
        stateDescription,
        hasWebSocketInstance: !!this._ws,
        shouldReconnect: this.shouldReconnect,
        currentRetryCount: this.currentRetryCount,
      });
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
        // Try to get a fresh Clerk token
        const clerkToken = await this.api.getToken();

        if (clerkToken) {
          telemetry.log('websocket.token.refresh.success', {
            code,
            message: 'Got fresh Clerk token for WebSocket reconnection',
          });

          // Return true to indicate we should attempt reconnection with the new token
          return true;
        } else {
          telemetry.log('websocket.token.refresh.no_clerk_token', {
            code,
            message: 'No Clerk token available for WebSocket reconnection',
          });

          return false;
        }
      } catch (error) {
        analytics.error(
          'Failed to get Clerk token for WebSocket reconnection',
          error,
        );

        // Log failed token refresh
        telemetry.log('websocket.token.refresh.failed', {
          code,
          error: error instanceof Error ? error.message : 'unknown_error',
        });

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

  /**
   * Force reconnection with fresh Clerk token
   * Useful when user authentication state changes
   */
  public async reconnectWithClerkToken(): Promise<void> {
    telemetry.log('websocket.reconnect.clerk_token_requested', {
      baseUrl: this.config.baseUrl,
      currentlyConnected: this._isConnected,
    });

    // Disconnect if currently connected
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.close(
        WebSocketCloseCode.NORMAL_CLOSURE,
        'Reconnecting with fresh token',
      );
    }

    // Reset connection state
    this._isConnected = false;
    this.currentRetryCount = 0;

    // Attempt to connect with fresh Clerk token
    await this.connect();
  }

  /**
   * Notify all listeners that the WebSocket instance has changed
   */
  protected notifyWsInstanceChange(): void {
    this.wsInstanceChangeListeners.forEach((listener) => {
      try {
        listener(this._ws);
      } catch (error) {
        analytics.error('Error in WebSocket instance change listener', error);
      }
    });
  }

  /**
   * Register a listener for WebSocket instance changes
   * Useful for React hooks that need to re-run when the WebSocket reconnects
   */
  public addWsInstanceChangeListener(
    listener: (ws: WebSocket | null) => void,
  ): void {
    this.wsInstanceChangeListeners.push(listener);
  }

  /**
   * Remove a WebSocket instance change listener
   */
  public removeWsInstanceChangeListener(
    listener: (ws: WebSocket | null) => void,
  ): void {
    this.wsInstanceChangeListeners = this.wsInstanceChangeListeners.filter(
      (l) => l !== listener,
    );
  }

  /**
   * Subscribe to a specific WebSocket event type.
   * The handler receives already-parsed, multitenancy-validated data.
   * Returns an unsubscribe function for convenience.
   */
  public subscribe(
    eventType: string,
    handler: (data: any) => void,
  ): () => void {
    let handlers = this.messageHandlers.get(eventType);
    if (!handlers) {
      handlers = new Set();
      this.messageHandlers.set(eventType, handlers);
    }
    handlers.add(handler);

    return () => this.unsubscribe(eventType, handler);
  }

  /**
   * Unsubscribe a handler from a specific event type.
   */
  public unsubscribe(eventType: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.messageHandlers.delete(eventType);
      }
    }
  }

  /**
   * Attach the central message dispatcher to the current WebSocket instance.
   * Called once per connection in onopen.
   */
  protected attachMessageDispatcher(): void {
    if (!this._ws) return;

    // Detach previous handler if any
    this.detachMessageDispatcher();

    this.boundMessageHandler = (e: MessageEvent) => {
      let data: any;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }

      const eventType = data?.type;
      if (!eventType) return;

      const handlers = this.messageHandlers.get(eventType);
      if (!handlers || handlers.size === 0) return;

      // Dispatch to all matching handlers
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          analytics.error('Error in WebSocket message handler', error);
        }
      });
    };

    this._ws.addEventListener('message', this.boundMessageHandler);
  }

  /**
   * Detach the central message dispatcher from the WebSocket.
   */
  protected detachMessageDispatcher(): void {
    if (this.boundMessageHandler && this._ws) {
      this._ws.removeEventListener('message', this.boundMessageHandler);
    }
    this.boundMessageHandler = null;
  }
}

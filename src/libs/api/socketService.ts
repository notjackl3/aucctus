import telemetry from '../telemetry';

/**
 * WebSocket Service for real-time communication
 *
 * CRITICAL BUG FIXED: Component unmount during route changes was disconnecting WebSocket
 * Root cause: useEffect cleanup in bootstrap component ran on every route change
 * Solution: Move unmount logic to detect quick unmounts (route changes) vs real app shutdown
 */

interface SocketConfig {
  baseUrl: string;
  autoConnect?: boolean;
  maxRetries?: number;
  reconnectInterval?: number;
}

class SocketService {
  private _websocket: WebSocket | null = null;
  private _isConnected: boolean = false;
  private _config: SocketConfig | null = null;
  private _token: string | null = null;
  private _retryCount: number = 0;
  private _reconnectTimeoutId: number | null = null;

  /**
   * Initialize the socket service
   */
  public initialize(config: SocketConfig): void {
    this._config = config;
    telemetry.log('websocket.service.initialized', {
      baseUrl: config.baseUrl,
      autoConnect: config.autoConnect,
    });

    if (config.autoConnect && this._token) {
      this.connect();
    }
  }

  /**
   * Update authentication token and handle connection logic
   */
  public updateToken(newToken: string | null): void {
    const hadPreviousToken = !!this._token;
    const hasNewToken = !!newToken;
    const wasConnected = this._isConnected;

    this._token = newToken;

    // Log token changes for debugging authentication flows
    telemetry.log('websocket.token.updated', {
      hadPreviousToken,
      hasNewToken,
      wasConnected,
      willReconnect: hasNewToken && !wasConnected,
      willDisconnect: !hasNewToken && wasConnected,
    });

    if (hasNewToken && !wasConnected && this._config?.autoConnect) {
      telemetry.log('websocket.token.change.connecting', {
        baseUrl: this._config.baseUrl,
        previousState: wasConnected ? 'connected' : 'disconnected',
      });
      this.connect();
    } else if (!hasNewToken && wasConnected) {
      this.disconnect();
    }
  }

  /**
   * Establish WebSocket connection
   */
  public async connect(): Promise<void> {
    if (!this._config) {
      throw new Error('Socket service not initialized');
    }

    if (!this._token) {
      throw new Error('No authentication token available');
    }

    if (
      this._isConnected ||
      (this._websocket && this._websocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this._clearReconnectTimeout();

    try {
      telemetry.log('websocket.connection.attempt', {
        baseUrl: this._config.baseUrl,
        retryCount: this._retryCount,
      });

      const wsUrl = `${this._config.baseUrl}?token=${this._token}`;
      this._websocket = new WebSocket(wsUrl);

      this._websocket.onopen = () => {
        this._isConnected = true;
        this._retryCount = 0;
        telemetry.log('websocket.connection.established', {
          baseUrl: this._config!.baseUrl,
          retryCount: this._retryCount,
        });
      };

      this._websocket.onclose = (event) => {
        const wasConnected = this._isConnected;
        this._isConnected = false;
        this._websocket = null;

        if (wasConnected) {
          telemetry.log('websocket.connection.closed', {
            baseUrl: this._config!.baseUrl,
            code: event.code,
            reason: event.reason,
          });
        } else {
          telemetry.log('websocket.connection.onclose.not_connected', {
            baseUrl: this._config!.baseUrl,
            code: event.code,
            reason: event.reason,
          });
        }

        // Only attempt reconnection if we have a token and haven't exceeded max retries
        if (this._token && this._retryCount < (this._config?.maxRetries || 5)) {
          this._scheduleReconnect();
        }
      };

      this._websocket.onerror = () => {
        telemetry.error('websocket.connection.error', {
          baseUrl: this._config!.baseUrl,
          retryCount: this._retryCount,
        });
      };

      this._websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._handleMessage(data);
        } catch (error) {
          telemetry.error('websocket.message.parse.failed', { error });
        }
      };
    } catch (error) {
      telemetry.error('websocket.connection.failed', {
        baseUrl: this._config.baseUrl,
        error,
      });
      throw error;
    }
  }

  /**
   * Close WebSocket connection
   */
  public async disconnect(): Promise<void> {
    // Log before setting _isConnected to false (CRITICAL: avoid logging wrong state)
    telemetry.log('websocket.connection.disconnect', {
      baseUrl: this._config?.baseUrl,
      wasConnected: this._isConnected,
    });

    this._isConnected = false;
    this._clearReconnectTimeout();

    if (this._websocket) {
      if (
        this._websocket.readyState === WebSocket.OPEN ||
        this._websocket.readyState === WebSocket.CONNECTING
      ) {
        this._websocket.close();
      }
      this._websocket = null;
    }
  }

  /**
   * Send message through WebSocket
   */
  public send(message: any): boolean {
    if (!this._websocket || this._websocket.readyState !== WebSocket.OPEN) {
      telemetry.log('websocket.message.send.failed', {
        reason: !this._websocket ? 'no_websocket_instance' : 'not_connected',
        message: typeof message,
      });
      return false;
    }

    try {
      this._websocket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      telemetry.error('websocket.message.send.error', { error });
      return false;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private _scheduleReconnect(): void {
    if (this._reconnectTimeoutId !== null) {
      return;
    }

    this._retryCount++;
    const interval = this._config?.reconnectInterval || 3000;

    this._reconnectTimeoutId = window.setTimeout(() => {
      this._reconnectTimeoutId = null;
      this.connect();
    }, interval);
  }

  /**
   * Clear reconnection timeout
   */
  private _clearReconnectTimeout(): void {
    if (this._reconnectTimeoutId !== null) {
      clearTimeout(this._reconnectTimeoutId);
      this._reconnectTimeoutId = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _handleMessage(data: any): void {
    // Handle different message types here
    // This is where you'd implement your message routing logic
  }

  // Getters
  public get isConnected(): boolean {
    return this._isConnected;
  }

  public get websocket(): WebSocket | null {
    return this._websocket;
  }
}

export default SocketService;

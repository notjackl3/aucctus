/* eslint-disable no-console */

import * as Sentry from '@sentry/react';

export interface ITelemetryStore {
  userAgent?: string;
  // Track the current route or tour step.
  currentRoute?: string;
  // Optionally, if you have a guided tour, store its state.
  currentTour?: string;
}

export interface ITelemetryConfig {
  enableDebug?: boolean;
  logger?: {
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
  trackingHandler?: (eventName: string, data?: any) => void;
  useSentry?: boolean;
}

class Telemetry {
  private _store: ITelemetryStore = {
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };

  private config: ITelemetryConfig;

  constructor(config?: ITelemetryConfig) {
    this.config = {
      enableDebug: import.meta.env.DEV,
      logger: {
        debug: console.debug.bind(console),
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      },
      useSentry: false,
      trackingHandler: undefined,
      ...config,
    };
  }

  update(data: Partial<ITelemetryStore>) {
    this._store = { ...this._store, ...data };
    this.debug('Telemetry updated:', this._store);
  }

  debug(...args: any[]) {
    if (this.config.enableDebug) {
      this.config.logger?.debug('[AucctusApp]', ...args);
      if (this.config.useSentry) {
        this._addSentryBreadcrumb('debug', args.join(' '), 'debug');
      }
    }
  }

  log(...args: any[]) {
    this.config.logger?.log('[AucctusApp]', ...args);
    if (this.config.useSentry) {
      this._addSentryBreadcrumb('log', args.join(' '), 'info');
    }
  }

  warn(...args: any[]) {
    this.config.logger?.warn('[AucctusApp]', ...args);
    if (this.config.useSentry) {
      this._addSentryBreadcrumb('warn', args.join(' '), 'warning');
      Sentry.captureMessage(args.join(' '), 'warning');
    }
  }

  error(...args: any[]) {
    this.config.logger?.error('[AucctusApp]', ...args);
    if (this.config.useSentry) {
      const errorObj =
        args[0] instanceof Error ? args[0] : new Error(args.join(' '));
      Sentry.captureException(errorObj);
    }
  }

  trackEvent(eventName: string, data?: any) {
    if (this.config.trackingHandler) {
      this.config.trackingHandler(eventName, data);
    } else {
      this.log(`Event: ${eventName}`, data);
    }
    if (this.config.useSentry) {
      this._addSentryBreadcrumb('event', `Event: ${eventName}`, data);
    }
  }

  private _addSentryBreadcrumb(category: string, message: string, data?: any) {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
    });
  }
}

const telemetry = new Telemetry({
  useSentry: true,
  trackingHandler: (eventName, data) => {
    // Custom tracking logic—e.g. send to Sentry or another analytics service.
    console.log(`[AucctusApp] Tracking event: ${eventName}`, data);
  },
});

export default telemetry;

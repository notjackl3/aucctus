import 'abort-controller/polyfill';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import analytics from '../../telemetry';
import { Api } from '../api';
import { IAuthSuccessResponse } from '../types';
import telemetry from '../../telemetry';
import { isTokenExpired, shouldRefreshToken } from '../../utils/jwt';

export const isAuthSuccessResponse = (
  value: unknown,
): value is IAuthSuccessResponse => {
  return (
    !!value &&
    !!(value as IAuthSuccessResponse).user &&
    !!(value as IAuthSuccessResponse).access
  );
};

const LOGOUT_STATUSES = [401, 403, 419];
export interface IApiServiceConfig {
  baseURL: string;
  apiVersion?: string;
  debug?: boolean;
  headers?: Partial<AxiosRequestHeaders>;
  timeoutSeconds?: number;
  withCredentials?: boolean;

  refreshToken?: () => Promise<string>;
  logout?: () => void | Promise<void>;
}

// Extend AxiosRequestConfig to include the _retry property
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

export interface AbortableRequest<T> {
  response: Promise<AxiosResponse<T>>;
  abort: () => void;
}

export abstract class ApiService {
  apiInstance: Api;
  api: AxiosInstance;
  config: IApiServiceConfig;

  protected abstract _excludeAllFromRefresh: boolean;
  protected abstract _excludePathFromRefresh: string[];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    this.apiInstance = apiInstance;
    this.config = apiConfig;
    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      headers: apiConfig.headers || {},
      timeout: (apiConfig.timeoutSeconds || 10) * 1000,
      withCredentials: apiConfig.withCredentials,
    });

    this._setupMiddleware();
  }

  protected _setupMiddleware(this: ApiService) {
    this.api.interceptors.request.use(this._requestMiddleware.bind(this));
    this.api.interceptors.response.use(
      this._responseMiddleware.bind(this),
      this._responseErrorMiddleware.bind(this),
    );
  }

  private async _requestMiddleware(config: InternalAxiosRequestConfig) {
    Object.assign(config.headers || {}, this.config.headers);

    // Skip token refresh check for excluded paths
    if (config.url && this._shouldSkipRefresh(config.url)) {
      return config;
    }

    // Check if we need to refresh the token proactively
    const accessToken = this.apiInstance.accessToken;
    if (accessToken) {
      try {
        // Check if token is expired or needs refresh (5 minutes buffer)
        if (
          isTokenExpired(accessToken, 60) ||
          shouldRefreshToken(accessToken, 300)
        ) {
          telemetry.debug(
            'Token expired or needs refresh, refreshing proactively',
          );

          // Prevent concurrent refresh attempts
          if (this.apiInstance.pendingRefresh) {
            await this.apiInstance.pendingRefresh;
          } else {
            await this.apiInstance.refreshToken();
          }

          // Update the request headers with the new token
          const newToken = this.apiInstance.accessToken;
          if (newToken && config.headers) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        }
      } catch (error) {
        analytics.error('Failed to refresh token proactively', error);
        // If proactive refresh fails, let the request proceed and handle 401 reactively
      }
    }

    return config;
  }

  private _responseMiddleware(response: AxiosResponse) {
    if (this.config.debug) {
      const method = response.config.method
        ? `[${response.config.method.toUpperCase()}]`
        : '';
      analytics.debug(
        `Api Call: ${method} ${response.config.baseURL + this.api.getUri(response.config)}`,
        response,
      );
    }
    return response;
  }

  private async _responseErrorMiddleware(error: AxiosError) {
    analytics.log('error', error);
    if (this.config.debug) {
      if (axios.isCancel(error)) {
        analytics.debug('Request Aborted: ', error);
      }
    }

    const status = (error.response && error.response.status) || 0;
    const url = error && error.config && error.config.url;

    if (
      url &&
      LOGOUT_STATUSES.includes(status) &&
      !this._shouldSkipRefresh(url)
    ) {
      const config = error.config as ExtendedAxiosRequestConfig;
      if (config && !config._retry) {
        config._retry = true; // This is required to prevent infinite loops
        telemetry.debug(
          `apiService: Attempting to refresh token - status=${status}`,
        );

        try {
          // Attempt to refresh the token
          let refreshResult;
          if (this.apiInstance.pendingRefresh) {
            refreshResult = await this.apiInstance.pendingRefresh;
          } else {
            refreshResult = await this.apiInstance.refreshToken();
          }

          // Check if refresh was successful and we have a new token
          if (refreshResult && this.apiInstance.accessToken) {
            analytics.debug(
              'Token refresh successful, retrying request',
              config.url,
            );

            // Update the authorization header with the new token
            if (!config.headers) {
              config.headers = {};
            }
            config.headers.Authorization = `Bearer ${this.apiInstance.accessToken}`;

            // Retry the original request with the new token
            return this.api.request({
              ...config,
              withCredentials: true,
            } as AxiosRequestConfig);
          } else {
            throw new Error('Token refresh failed - no new token received');
          }
        } catch (refreshError) {
          analytics.error('Token refresh failed', refreshError);
          telemetry.debug('Logging out due to failed token refresh');
          this.apiInstance.logout();
          return Promise.reject(refreshError);
        }
      } else {
        // If this is a retry attempt that failed, logout
        analytics.debug('Retry attempt failed, logging out');
        this.apiInstance.logout();
      }
    }

    return Promise.reject(error);
  }

  protected _handleAccessToken() {
    const accessToken = this.apiInstance.accessToken;
    const config = Object.assign({ headers: {} }, this.config);
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  protected _shouldSkipRefresh(url: string): boolean {
    if (this._excludeAllFromRefresh) {
      return true;
    }

    const path = url.split('?')[0];
    // analytics.debug('Checking if path should be excluded from refresh:', path, url);
    return this._excludePathFromRefresh.includes(path);
  }

  updateConfigHeaders(headers: Partial<AxiosRequestHeaders>) {
    this.config.headers = Object.assign(
      this.config.headers || {},
      headers,
    ) as AxiosRequestHeaders;
  }

  /** Get
   *
   * @param url
   * @param config
   * @returns
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /** Abortable Get
   *
   * @param url
   * @param config
   * @returns
   */
  abortableGet<T = unknown>(url: string, config?: AxiosRequestConfig) {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const axiosConfig = config || {};
    axiosConfig.signal = signal;

    const response: Promise<AxiosResponse<T>> = this.api.get(url, axiosConfig);
    return {
      response,
      abort: () => {
        abortController.abort();
      },
    };
  }

  post<T = unknown, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<T>;
  async post<T = unknown, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T = unknown, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T = unknown, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.patch(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

import { Api } from './api';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import 'abort-controller/polyfill';
import analytics from '../analytics';
import { IAuthSuccessResponse } from './typings';
import { ExpiryTimeNotFoundError, TokenStructureError } from './customErrors';

export const isAuthSuccessResponse = (value: unknown): value is IAuthSuccessResponse => {
  return !!value && !!(value as IAuthSuccessResponse).user && !!(value as IAuthSuccessResponse).access;
};

const LOGOUT_STATUSES = [401, 403, 419];
export interface IApiServiceConfig {
  baseURL: string;
  apiVersion?: string;
  debug?: boolean;
  headers?: AxiosRequestHeaders;
  timeoutSeconds?: number;

  refreshToken?: () => Promise<string>;
  logout?: () => void | Promise<void>;
}

export abstract class ApiService {
  apiInstance: Api;
  api: AxiosInstance;
  config: IApiServiceConfig;

  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    this.apiInstance = apiInstance;
    this.config = apiConfig;

    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      headers: apiConfig.headers,
      timeout: (apiConfig.timeoutSeconds || 10) * 1000,
    });

    this._setupMiddleware();
  }

  private _setupMiddleware() {
    this.api.interceptors.request.use(this._requestMiddleware.bind(this));
    this.api.interceptors.response.use(this._responseMiddleware.bind(this), this._responseErrorMiddleware.bind(this));
  }

  private async _requestMiddleware(config: InternalAxiosRequestConfig) {
    const accessToken = this.apiInstance.accessToken;

    if (!this._shouldSkipRefresh(config.url || '')) {
      if (this.apiInstance.pendingRefresh) {
        await this.apiInstance.pendingRefresh;
      }
      try {
        if (accessToken && this.hasTokenExpired(accessToken)) {
          await this.apiInstance.refreshToken();
          Object.assign(config || {}, this._handleAccessToken());
        }
      } catch (error) {
        console.error(error);
      }
    }

    Object.assign(config.headers || {}, this.config.headers);

    return config;
  }

  private _responseMiddleware(response: AxiosResponse) {
    if (this.config.debug) {
      const method = response.config.method ? `[${response.config.method.toUpperCase()}]` : '';
      analytics.debug(`Api Call: ${method} ${response.config.baseURL + this.api.getUri(response.config)}`, response);
    }
    return response;
  }

  private async _responseErrorMiddleware(error: AxiosError) {
    if (this.config.debug) {
      if (axios.isCancel(error)) {
        analytics.debug('Request Aborted: ', error);
      }

      const status = (error.response && error.response.status) || 0;
      if (LOGOUT_STATUSES.includes(status) && !this._shouldSkipRefresh(error?.config?.url || '')) {
        try {
          if (error.config) {
            // Attempt to refresh the token
            if (!this.apiInstance.pendingRefresh) {
              await this.apiInstance.refreshToken();
            } else {
              await this.apiInstance.pendingRefresh;
            }
            // Retry the original request
            return this.api.request({
              ...error.config,
              ...this._handleAccessToken(),
              withCredentials: true,
            } as AxiosRequestConfig);
          }
        } catch (err) {}
        // If the error is due to being unauthenticated then logout
        analytics.debug('Logging out due to unauthenticated status');
        this.apiInstance.logout();
      }

      if (axios.isAxiosError(error)) {
        const method = error.config && error.config.method ? `[${error.config.method.toUpperCase()}]` : '';
        analytics.error(`Api Error: ${method} ${error.name}`, error);
      }
    }

    return Promise.reject(error);
  }

  hasTokenExpired(token: string): boolean {
    analytics.debug('Checking token expiry...');
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new TokenStructureError('Token structure incorrect');
    }

    const payload = parts[1];
    // Use atob for base64 decoding in the browser
    const decodedPayload = atob(payload);
    const payloadData = JSON.parse(decodedPayload);

    const exp = payloadData.exp;

    if (!exp) {
      throw new ExpiryTimeNotFoundError('Expiry time not found in token.');
    }

    analytics.debug('Token expiry:', new Date(exp * 1000));
    const expiryDate = new Date(exp * 1000);
    const now = new Date();

    return expiryDate <= now;
  }

  protected _handleAccessToken(): AxiosRequestConfig {
    const accessToken = this.apiInstance.accessToken;
    const config = Object.assign({ headers: {} }, this.config);
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  private _shouldSkipRefresh(url: string): boolean {
    if (this._excludeAllFromRefresh) {
      return true;
    }

    const path = url.split('?')[0];
    return this._excludePathFromRefresh.includes(path);
  }

  updateConfigHeaders(headers: Partial<AxiosRequestHeaders>) {
    this.config.headers = Object.assign(this.config.headers || {}, headers) as AxiosRequestHeaders;
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

  post<T = unknown, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  async post<T = unknown, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T = unknown, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T = unknown, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

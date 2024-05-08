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
import { IAuthSuccessResponse } from './types';
import { hasTokenExpired, sleep } from '../utils';

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

  protected abstract _excludeAllFromRefresh: boolean;
  protected abstract _excludePathFromRefresh: string[];

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

  protected _setupMiddleware(this: ApiService) {
    this.api.interceptors.request.use(this._requestMiddleware.bind(this));
    this.api.interceptors.response.use(this._responseMiddleware.bind(this), this._responseErrorMiddleware.bind(this));
  }

  private async _requestMiddleware(config: InternalAxiosRequestConfig) {
    const accessToken = this.apiInstance.accessToken;

    if (!this._shouldSkipRefresh(config.url || '')) {
      try {
        if (accessToken && hasTokenExpired(accessToken)) {
          await sleep(1000 * Math.random());
          if (this.apiInstance.pendingRefresh) {
            await this.apiInstance.pendingRefresh;
          } else {
            await this.apiInstance.refreshToken();
          }
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
    }

    const status = (error.response && error.response.status) || 0;
    const url = error && error.config && error.config.url;
    if (url && LOGOUT_STATUSES.includes(status) && !this._shouldSkipRefresh(url)) {
      try {
        if (error.config) {
          // Attempt to refresh the token
          if (this.apiInstance.pendingRefresh) {
            await this.apiInstance.pendingRefresh;
          } else {
            await this.apiInstance.refreshToken();
          }

          analytics.debug('Retrying request after token refresh', error.config.url);
          // Retry the original request
          return this.api.request({
            ...error.config,
            ...this._handleAccessToken(),
            withCredentials: true,
          } as AxiosRequestConfig);
        }
      } catch (err) {
        analytics.debug('Logging out due to unauthenticated status');
        this.apiInstance.logout();
        return Promise.reject(err);
      }
    }

    if (axios.isAxiosError(error)) {
      const method = error.config && error.config.method ? `[${error.config.method.toUpperCase()}]` : '';
      analytics.error(`Api Error: ${method} ${error.name}`, error);
    }

    return Promise.reject(error);
  }

  protected _handleAccessToken(): AxiosRequestConfig {
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

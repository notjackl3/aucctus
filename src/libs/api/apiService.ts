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

export const isAuthSuccessResponse = (value: unknown): value is IAuthSuccessResponse => {
  return !!value && !!(value as IAuthSuccessResponse).user && !!(value as IAuthSuccessResponse).token;
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

export interface ApiServiceRequestConfig<D = any> extends AxiosRequestConfig<D> {
  skipAuthRefresh?: boolean;
}

export class ApiService {
  apiInstance: Api;
  api: AxiosInstance;
  config: IApiServiceConfig;

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

  private _requestMiddleware(config: InternalAxiosRequestConfig) {
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
        console.log('Request Aborted: ', error);
      }

      if (axios.isAxiosError(error)) {
        const method = error.config && error.config.method ? `[${error.config.method.toUpperCase()}]` : '';
        analytics.error(`Api Error: ${method} ${error.name}`, error);

        // Skip the refresh logic if the flag is set
        if (error.config && (error.config as ApiServiceRequestConfig).skipAuthRefresh) {
          return Promise.reject(error);
        }

        // If the error is due to being unauthenticated
        if (error.response && error.response.status === 401 && this.apiInstance.authRetryCount < 1) {
          try {
            if (error.config) {
              // Attempt to refresh the token
              await this.apiInstance.refreshToken();

              this.apiInstance.authRetryCount++;

              // Retry the original request
              return this.api.request(error.config).then(() => {
                this.apiInstance.authRetryCount = 0;
              });
            }
          } catch (err) {
            this.apiInstance.authRetryCount = 0;
          }
        }
      }
    }

    // If the error is due to being unauthenticated then logout
    const status = (error.response && error.response.status) || 0;
    if (LOGOUT_STATUSES.includes(status)) {
      // TODO: Add message for the user to tell them why they are being logged out
      this.apiInstance.logout();
    }

    return Promise.reject(error);
  }

  protected _handleAccessToken(): ApiServiceRequestConfig {
    const accessToken = this.apiInstance.accessToken;
    const config = Object.assign({ headers: {} }, this.config);
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
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
  async get<T = unknown>(url: string, config?: ApiServiceRequestConfig): Promise<T> {
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
  abortableGet<T = unknown>(url: string, config?: ApiServiceRequestConfig) {
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

  post<T = unknown, D = any>(url: string, data?: D, config?: ApiServiceRequestConfig<D>): Promise<T>;
  async post<T = unknown, D = any>(url: string, data?: D, config?: ApiServiceRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = unknown>(url: string, config?: ApiServiceRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put<T = unknown, D = any>(url: string, data?: D, config?: ApiServiceRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async patch<T = unknown, D = any>(url: string, data?: D, config?: ApiServiceRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

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

export interface AbortableRequest<T> {
  response: Promise<AxiosResponse<T>>;
  abort: () => void;
}

export abstract class ApiService {
  apiInstance: Api;
  api: AxiosInstance;
  config: IApiServiceConfig;

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

    try {
      // Get Clerk token for authorization
      const clerkToken = await this.apiInstance.getToken();

      if (clerkToken) {
        // Set authorization header with Clerk token
        if (config.headers) {
          config.headers.Authorization = `Bearer ${clerkToken}`;
        }
      }
    } catch (error) {
      analytics.error('Failed to get Clerk token for request', error);
      // If token retrieval fails, let the request proceed and handle 401 reactively
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

    // For authentication errors, let Clerk handle session management
    if (LOGOUT_STATUSES.includes(status)) {
      analytics.debug(
        `Authentication error (${status}) - Clerk will handle session management`,
      );
      // Don't attempt token refresh - Clerk manages its own tokens
      // Let the error propagate to trigger Clerk's authentication flow
    }

    return Promise.reject(error);
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

  /**
   * POST with multipart/form-data for file uploads
   * Axios automatically sets the Content-Type header for FormData
   */
  async postFormData<T = unknown>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

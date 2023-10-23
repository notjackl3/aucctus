import { Api } from "./api";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import "abort-controller/polyfill"
import { INestJSErrorResponse } from "./typings/avxisi";
import analytics from "../analytics";
import { IAuthSuccessResponse } from "./typings";





export const isAuthSuccessResponse = (value: unknown): value is IAuthSuccessResponse => {
  return !!value && !!(value as IAuthSuccessResponse).user && !!(value as IAuthSuccessResponse).accessToken
}



export interface IApiServiceConfig {
  baseURL: string;
  apiVersion?: string;
  debug?: boolean;
  headers?: AxiosRequestHeaders;
  timeoutSeconds?: number
}


export class ApiService {
  apiInstance: Api
  api: AxiosInstance
  config: IApiServiceConfig

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    this.apiInstance = apiInstance
    this.config = apiConfig

    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      headers: apiConfig.headers,
      timeout: (apiConfig.timeoutSeconds || 10) * 1000
    })

    this._setupMiddleware()
  }


  private _setupMiddleware() {
    this.api.interceptors.request.use(this._requestMiddleware.bind(this))
    this.api.interceptors.response.use(this._responseMiddleware.bind(this), this._responseErrorMiddleware.bind(this))
  }

  private _requestMiddleware(config: InternalAxiosRequestConfig) {
    Object.assign(config.headers || {}, this.config.headers)
    return config
  }


  private _responseMiddleware(response: AxiosResponse) {
    if (this.config.debug) {
      const method = response.config.method ? `[${response.config.method.toUpperCase()}]` : ''
      console.log(`Api Call: ${method} ${response.config.baseURL + this.api.getUri(response.config)}`, response)
    }
    return response
  }


  private _responseErrorMiddleware(error: AxiosError) {
    if (this.config.debug) {
      if (axios.isCancel(error)) {
        console.log('Request Aborted: ', error)
      }

      if (axios.isAxiosError(error)) {
        const method = error.config && error.config.method ? `[${error.config.method.toUpperCase()}]` : ''
        console.error(`Api Error: ${method} ${error.name}`, error)
      }
    }
    return Promise.reject(error)
  }

  protected _handleAccessToken(): AxiosRequestConfig {
    const accessToken = this.apiInstance.accessToken;
    const config = Object.assign({ headers: {} }, this.config)
    config.headers.Authorization = `Bearer ${accessToken}`
    return config
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
      return response.data
    } catch (error) {
      analytics.debug(JSON.stringify(error))
      throw error
    }
  }

  /** Abortable Get
   * 
   * @param url 
   * @param config 
   * @returns 
   */
  abortableGet<T = unknown>(url: string, config?: AxiosRequestConfig) {
    const abortController = new AbortController()
    const signal = abortController.signal;
    const axiosConfig = config || {};
    axiosConfig.signal = signal;

    const response: Promise<AxiosResponse<T>> = this.api.get(url, axiosConfig);
    return {
      response,
      abort: () => {
        abortController.abort()
      }
    }
  }

  post<T = unknown, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>
  async post<T = unknown, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      return response.data
    } catch (error) {
      analytics.debug(JSON.stringify(error))
      throw error
    }
  }


  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      return response.data
    } catch (error) {
      analytics.debug(JSON.stringify(error))
      throw error
    }
  }

  async put<T = unknown, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      return response.data
    } catch (error) {
      analytics.debug(JSON.stringify(error))
      throw error
    }
  }
}
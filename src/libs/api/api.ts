import { AxiosRequestHeaders } from "axios";
import { IApiServiceConfig } from "./apiService";
import { AuthApi } from "./auth";



export interface IApiConfig {
  /* End Points */
  authBaseUrl: string;

  /* Settings */
  defaultHeaders?: AxiosRequestHeaders;
  timeoutSeconds: number;
  debug: boolean;
  appId: string;
}


export class Api {
  private _config: IApiConfig
  auth: AuthApi

  constructor(apiConfig: IApiConfig) {
    this._config = apiConfig

    this.auth = new AuthApi(this, this.buildConfig({
      baseURL: this._config.authBaseUrl
    }))

  }

  buildConfig(config: IApiServiceConfig): IApiServiceConfig {
    if (config.headers) {
      Object.assign(config.headers, this._config.defaultHeaders || {})
    }
    return Object.assign(config, {
      timeoutSeconds: this._config.timeoutSeconds,
      debug: this._config.debug
    })
  }
}

export default Api
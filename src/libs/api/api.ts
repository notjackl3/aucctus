import { HeadersDefaults } from 'axios';
import { IApiServiceConfig } from './apiService';
import { AuthApi } from './auth';
import { AccountApi } from './account';
import analytics from '../analytics';

export interface IApiConfig {
  /* End Points */
  baseUrl: string;

  /* Settings */
  defaultHeaders?: HeadersDefaults;
  timeoutSeconds: number;
  debug: boolean;
  appId: string;
}

export class Api {
  private _config: IApiConfig;

  _accessToken?: string;

  auth: AuthApi;
  account: AccountApi;

  constructor(apiConfig: IApiConfig) {
    this._config = apiConfig;

    this.auth = new AuthApi(
      this,
      this.buildConfig({
        baseURL: this._config.baseUrl,
      })
    );

    this.account = new AccountApi(
      this,
      this.buildConfig({
        baseURL: this._config.baseUrl,
      })
    );
  }

  get accessToken() {
    return this._accessToken;
  }

  set accessToken(token: string | undefined) {
    // Update all pointing to the resource server with the new tokens
    // By default however,  the access token and refresh token are set to the httpOnly cookies
    // This is simply just an extra layer.

    [this.account].forEach((api) => {
      api.updateConfigHeaders({ Authorization: `Bearer ${token}` });
      api.config.headers = Object.assign({}, api.config.headers, { Authorization: `Bearer ${token}` });
      console.log(api.config.headers, 'api.config.headers');
    });
    analytics.debug('Setting Access Token');
    this._accessToken = token;
  }

  buildConfig(config: IApiServiceConfig): IApiServiceConfig {
    if (config.headers) {
      Object.assign(config.headers, this._config.defaultHeaders || {});
    }
    return Object.assign(config, {
      timeoutSeconds: this._config.timeoutSeconds,
      debug: this._config.debug,
    });
  }
}

export default Api;

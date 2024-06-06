import { HeadersDefaults } from 'axios';
import { IApiServiceConfig } from './apiService';
import { AuthApi } from './auth';
import { AccountApi } from './account';
import analytics from '../analytics';
import { ConceptApi } from './concepts';
import { IgniteConceptApi } from './igniteConcepts';
import { ITokenResponse } from './types';
import { toast } from 'react-toastify';

export interface IApiConfig {
  /* End Points */
  baseUrl: string;
  baseFastUrl: string;
  /* Settings */
  defaultHeaders?: HeadersDefaults;
  timeoutSeconds: number;
  debug: boolean;
  appId: string;
}

export class Api {
  private _config: IApiConfig;

  private _accessToken?: string;
  private _refreshTokenAction?: () => Promise<ITokenResponse | undefined>;
  private _logoutAction?: () => void;

  pendingRefresh?: Promise<ITokenResponse | undefined> = void 0;

  auth: AuthApi;
  account: AccountApi;
  concept: ConceptApi;
  conceptIgnite: IgniteConceptApi;

  constructor(apiConfig: IApiConfig) {
    this._config = apiConfig;

    this.auth = new AuthApi(
      this,
      this.buildConfig({
        baseURL: this._config.baseUrl,
      }),
    );

    this.account = new AccountApi(
      this,
      this.buildConfig({
        baseURL: this._config.baseUrl,
      }),
    );

    this.concept = new ConceptApi(this, this.buildConfig({ baseURL: this._config.baseUrl }));
    this.conceptIgnite = new IgniteConceptApi(this, this.buildConfig({ baseURL: this._config.baseFastUrl }));
  }

  get accessToken() {
    return this._accessToken;
  }

  set accessToken(token: string | undefined) {
    // Update all pointing to the resource server with the new tokens
    // By default however,  the access token and refresh token are set to the httpOnly cookies
    // This is simply just an extra layer.
    [this.account, this.concept, this.conceptIgnite].forEach((api) => {
      api.updateConfigHeaders({ Authorization: `Bearer ${token}` });
      api.config.headers = Object.assign({}, api.config.headers, { Authorization: `Bearer ${token}` });
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

  // Method to update the refresh token action dynamically
  setRefreshTokenAction(action: () => Promise<ITokenResponse | undefined>, callback?: () => void) {
    this._refreshTokenAction = action;
    if (callback) {
      console.log('Setting callback');
      callback();
    }
  }

  // Method to update the logout action dynamically
  setLogoutAction(action: () => void) {
    this._logoutAction = action;
  }

  // Expose these actions through methods to be used in ApiService
  async refreshToken() {
    try {
      if (this._refreshTokenAction !== undefined) {
        this.pendingRefresh = this._refreshTokenAction();
        return await this.pendingRefresh.finally(() => {
          this.pendingRefresh = void 0;
        });
      } else {
        throw new Error('Refresh token action has not been set.');
      }
    } catch (error) {
      analytics.error('Error refreshing token', error);
    }
  }

  logout() {
    if (this._logoutAction !== undefined) {
      toast.warning('You have been logged out. Please login again.');
      return this._logoutAction();
    } else {
      console.warn('Logout action has not been set.');
    }
  }
}

export default Api;

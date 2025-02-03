import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IAuthSuccessResponse,
  IMessageResponse,
  ISignInRequest,
  ISignUpRequest,
  IToken,
  ITokenResponse,
  IUpdateForgottenPasswordRequest,
} from './types';

export class AuthApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = true;
  protected _excludePathFromRefresh: string[] = [
    endpoints.refresh,
    endpoints.logout,
    endpoints.signup,
    endpoints.login,
    endpoints.confirmEmail,
    endpoints.requestPasswordReset,
    endpoints.forgotPassword,
    endpoints.logout,
  ];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  /** Sign Up
   *
   * @param name
   * @param email
   * @param password
   * @param password2
   * @returns
   */
  signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) {
    return this.post<IMessageResponse, ISignUpRequest>(endpoints.signup, {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      confirmPassword,
    });
  }

  /** Sign In
   *
   * @param email
   * @param password
   * @returns
   */
  login(email: string, password: string) {
    return this.post<IAuthSuccessResponse, ISignInRequest>(endpoints.login, {
      email: email.toLowerCase(),
      password,
    });
  }

  logout(accessToken?: string, refreshToken?: string) {
    return this.post<IMessageResponse>(
      endpoints.logout,
      { refresh: refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  }

  /**
   *
   * @param email
   * @returns
   */
  requestPasswordReset(email: string) {
    return this.post<IMessageResponse>(endpoints.requestPasswordReset, {
      email: email.toLowerCase(),
    });
  }

  resetPassword(password: string, confirmPassword: string, token: string) {
    return this.post<IMessageResponse, IUpdateForgottenPasswordRequest>(
      endpoints.forgotPassword,
      {
        password,
        confirmPassword,
        token,
      },
    );
  }

  /** RefreshToken
   * Note that the Refresh token is stored in the HTTPOnly headers. In most cases unless we run into any issues
   * It will stay like that for the forseeable future.
   * @returns
   */
  refreshToken(refresh: string) {
    return this.post<ITokenResponse>(
      endpoints.refresh,
      { refresh },
      {
        withCredentials: true,
      },
    );
  }

  /** Confirm Email
   *
   * @param token
   * @returns
   */
  confirmEmail(token: string) {
    return this.post<IMessageResponse, IToken>(endpoints.confirmEmail, {
      token,
    });
  }
}

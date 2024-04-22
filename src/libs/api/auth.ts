import {
  IAuthSuccessResponse,
  ITokenResponse,
  ISignInRequest,
  ISignUpRequest,
  IToken,
  IUpdateForgottenPasswordRequest,
} from './typings';
import { ApiService } from './apiService';
import { endpoints } from './endpoints';
import { IMessageResponse } from './typings/avxisi';

export class AuthApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = true;

  /** Sign Up
   *
   * @param name
   * @param email
   * @param password
   * @param password2
   * @returns
   */
  signup(firstName: string, lastName: string, email: string, password: string, confirmPassword: string) {
    return this.post<IMessageResponse, ISignUpRequest>(endpoints.signup, {
      firstName,
      lastName,
      email,
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
    return this.post<IAuthSuccessResponse, ISignInRequest>(endpoints.login, { email, password });
  }

  logout(token?: string) {
    return this.post<IMessageResponse>(endpoints.logout, { token });
  }

  /**
   *
   * @param email
   * @returns
   */
  requestPasswordReset(email: string) {
    return this.post<IMessageResponse>(endpoints.requestPasswordReset, { email });
  }

  resetPassword(password: string, confirmPassword: string, token: string) {
    return this.post<IMessageResponse, IUpdateForgottenPasswordRequest>(endpoints.forgotPassword, {
      password,
      confirmPassword,
      token,
    });
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
      }
    );
  }

  /** Confirm Email
   *
   * @param token
   * @returns
   */
  confirmEmail(token: string) {
    return this.post<IMessageResponse, IToken>(endpoints.confirmEmail, { token });
  }
}

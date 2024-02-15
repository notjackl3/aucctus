import { IAuthSuccessResponse, IToken, IUpdateForgottenPasswordRequest } from './typings';
import { ApiService } from './apiService';
import { endpoints } from './endpoints';
import { IMessageResponse } from './typings/avxisi';

export interface ISignInRequest {
  email: string;
  password: string;
}

export interface ISignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export class AuthApi extends ApiService {
  /** Sign Up
   *
   * @param name
   * @param email
   * @param password
   * @param password2
   * @returns
   */
  async signup(firstName: string, lastName: string, email: string, password: string, confirmPassword: string) {
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
  async login(email: string, password: string) {
    return this.post<IAuthSuccessResponse, ISignInRequest>(endpoints.login, { email, password });
  }

  async logout() {
    return this.post<IMessageResponse>(endpoints.logout, null, this._handleAccessToken());
  }

  /**
   *
   * @param email
   * @returns
   */
  async forgotPassword(email: string) {
    return this.get<IMessageResponse>(endpoints.forgotPassword(email));
  }

  async updateForgottenPassword(password: string, confirmPassword: string, token: string) {
    return this.post<IMessageResponse, IUpdateForgottenPasswordRequest>(endpoints.forgotPassword(), {
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
  async refreshToken(token?: string) {
    return this.post<IAuthSuccessResponse>(endpoints.refresh, token ? { token } : undefined);
  }

  /** Confirm Email
   *
   * @param accessToken
   * @returns
   */
  async confirmEmail(token: string) {
    return this.post<IAuthSuccessResponse, IToken>(endpoints.confirmEmail, { token });
  }
}

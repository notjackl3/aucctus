import { AxiosRequestConfig } from "axios";
import { IAuthSuccessResponse } from "./typings";
import { ApiService } from "./apiService";
import { endpoints } from "./endpoints";

export interface ISignInRequest {
  email: string;
  password: string;
}

export interface ISignUpRequest {
  name: string;
  email: string;
  password: string;
  password2: string;
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
  async signup(name: string, email: string, password: string, confirmPassword: string) {
    return this.post<ISignUpRequest, ISignUpRequest>(endpoints.Signup, { name, email, password, password2: confirmPassword })
  }

  /** Sign In
   * 
   * @param email 
   * @param password 
   * @returns 
   */
  async signIn(email: string, password: string) {
    return this.post<IAuthSuccessResponse, ISignInRequest>(endpoints.SignIn, { email, password })
  }

  /** Me
   * 
   * @param accessToken 
   * @returns 
   */
  async Me(accessToken: string) {
    return this.get(endpoints.Me, this._handleAccessToken(accessToken))
  }


  /** RefreshToken
   * 
   * @returns 
   */
  async refreshToken() {
    this.api.defaults.withCredentials = true;
    return this.post<IAuthSuccessResponse>(endpoints.Refresh, { withCredentials: true })
  }


  /** Confirm Email
   * 
   * @param accessToken 
   * @returns 
   */
  async confirmEmail(token: string) {
    return this.get<IAuthSuccessResponse>(endpoints.confirmEmail(token))
  }




  private _handleAccessToken(accessToken: string): AxiosRequestConfig {
    const config = Object.assign({ headers: {} }, this.config)
    config.headers.Authorization = `Bearer ${accessToken}`
    return config
  }

}
import { AxiosRequestConfig } from "axios";
import { IAuthSuccessResponse } from "./typings";
import { ApiService } from "./apiService";
import { endpoints } from "./endpoints";



export interface ISignInRequest {
  emailOrUsername: string;
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
  async signup(name: string, email: string, password: string, password2: string) {
    return this.post<IAuthSuccessResponse, ISignUpRequest>(endpoints.Signup, { name, email, password, password2 })
  }

  /** Sign In
   * 
   * @param emailOrUsername 
   * @param password 
   * @returns 
   */
  async signIn(emailOrUsername: string, password: string) {
    return this.post<IAuthSuccessResponse, ISignInRequest>(endpoints.SignIn, { emailOrUsername, password })
  }

  /** Me
   * 
   * @param accessToken 
   * @returns 
   */
  async Me(accessToken: string) {
    return this.get(endpoints.Me, this._handleAccessToken(accessToken))
  }



  private _handleAccessToken(accessToken: string): AxiosRequestConfig {
    const config = Object.assign({ headers: {} }, this.config)
    config.headers.Authorization = `Bearer ${accessToken}`
    return config
  }

}
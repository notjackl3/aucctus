import { HeadersDefaults } from "axios";
import { IApiServiceConfig } from "./apiService";
import { AuthApi } from "./auth";
import { OrganizationApi } from "./organization";
import { IgniteConceptApi } from "./igniteConcept";
import { IgniteDomainApi } from "./igniteDomain";
import { IChallenge } from "./typings/challenges";
import { ChallengeApi } from "./challenge";



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
  private _config: IApiConfig

  accessToken?: string;

  auth: AuthApi
  organization: OrganizationApi;
  igniteConcept: IgniteConceptApi;
  igniteDomain: IgniteDomainApi;
  challenge: ChallengeApi;

  constructor(apiConfig: IApiConfig) {
    this._config = apiConfig

    this.auth = new AuthApi(this, this.buildConfig({
      baseURL: this._config.baseUrl,
    }))

    this.organization = new OrganizationApi(this, this.buildConfig({
      baseURL: this._config.baseUrl,
    }))

    this.igniteConcept = new IgniteConceptApi(this, this.buildConfig({
      baseURL: this._config.baseUrl,
    }))

    this.igniteDomain = new IgniteDomainApi(this, this.buildConfig({
      baseURL: this._config.baseUrl
    }))

    this.challenge = new ChallengeApi(this, this.buildConfig({
      baseURL: this._config.baseUrl
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
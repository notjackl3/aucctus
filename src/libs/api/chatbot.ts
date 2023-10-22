import { ApiService } from "./apiService"
import { endpoints } from "./endpoints"
import { IIgniteConceptBody, IIgniteConceptSuccessResponse } from "./typings/ignite-concepts";
import { IIgniteDomainBody, IIgniteDomainSuccessResponse } from "./typings/ignite-domain";






export class IgniteApi extends ApiService {

  /** Ignite Domain
   * 
   * @param form 
   * @returns 
   */
  async domain(form: IIgniteDomainBody) {
    return this.post<IIgniteDomainSuccessResponse, IIgniteDomainBody>(endpoints.igniteDomain, form, this._handleAccessToken())
  }


  /** Ignite Concept
   * 
   * @param form 
   * @returns 
   */
  async concept(form: IIgniteConceptBody) {
    return this.post<IIgniteConceptSuccessResponse, IIgniteConceptBody>(endpoints.igniteDomain, form, this._handleAccessToken())
  }

}
import { ApiService } from "./apiService"
import { endpoints } from "./endpoints"

export class OrganizationApi extends ApiService {


  async getOrganization(id: string) {
    this._handleAccessToken(this.apiInstance.accessToken)
    return this.get<IOrganizationSuccessResponse>(endpoints.getOrganization(id))
  }

}
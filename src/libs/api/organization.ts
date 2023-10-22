import { ApiService } from "./apiService"
import { endpoints } from "./endpoints"

export class OrganizationApi extends ApiService {


  async getOrganization(id: string) {
    return this.get<IOrganizationSuccessResponse>(endpoints.getOrganization(id), this._handleAccessToken())
  }

}
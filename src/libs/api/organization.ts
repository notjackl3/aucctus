import { ApiService } from "./apiService"
import { endpoints } from "./endpoints"

export class OrganizationApi extends ApiService {


  async getOrganization() {
    return this.get<IOrganizationSuccessResponse>(endpoints.organization, this._handleAccessToken())
  }

  async getKips() {
    return this.get<string[]>(endpoints.organizationKpi, this._handleAccessToken())
  }


  async getInnovationGoal() {
    return this.get<string>(endpoints.organizationInnovationGoal, this._handleAccessToken())
  }

}
import { ApiService } from "./apiService"
import { endpoints } from "./endpoints"
import { IArticle, IOrganizationSuccessResponse } from "./typings/organization"

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

  async getCompetitors() {
    return this.get<string[]>(endpoints.organizationCompetitors, this._handleAccessToken())
  }

  async getCompetitorNews() {
    return this.get<IArticle[]>(endpoints.competitorNews, this._handleAccessToken())
  }

}
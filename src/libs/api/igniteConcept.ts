import { ApiService } from "./apiService";
import { endpoints } from "./endpoints";
import { IConceptResponse, IIgniteConceptBody, IIgniteConceptSuccessResponse } from "./typings/ignite-concepts";

export class IgniteConceptApi extends ApiService {


  /** Ignite Concept
   * 
   * @param form 
   * @returns 
   */
  async generateConcepts(form: IIgniteConceptBody) {
    return this.post<IIgniteConceptSuccessResponse, IIgniteConceptBody>(endpoints.igniteConcept, form, this._handleAccessToken())
  }

  async getIgniteConcept(igniteId: string) {
    return this.get<IIgniteConceptSuccessResponse>(endpoints.getIgniteConcept(igniteId), this._handleAccessToken())
  }

  async deleteIgniteConcept(igniteId: string) {
    return this.delete<IIgniteConceptSuccessResponse>(endpoints.igniteConcept, this._handleAccessToken())
  }

  /**
   * 
   */
  async getAllGeneratedConcepts(igniteId: string) {
    return this.get<IConceptResponse[]>(endpoints.getAllConcepts(igniteId), this._handleAccessToken())
  }

  async deleteGeneratedConcept(id: string) {
    return this.delete<IConceptResponse>(endpoints.getConcept(id), this._handleAccessToken())
  }

  async getGeneratedConcept(id: string) {
    return this.get<IConceptResponse>(endpoints.getConcept(id), this._handleAccessToken())
  }


}
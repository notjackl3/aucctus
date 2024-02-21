import { ApiService } from './apiService';
import { endpoints } from './endpoints';
import { IMessageResponse } from './typings/avxisi';
import {
  IConceptCustomerProfile,
  IConceptOverview,
  IConceptResponse,
  IIgniteConceptBody,
  IIgniteConceptSuccessResponse,
} from './typings/ignite-concepts';

export class IgniteConceptApi extends ApiService {
  /** Ignite Concept
   *
   * @param form
   * @returns
   */
  // async generateConcepts(form: IIgniteConceptBody) {
  //   return this.post<IConceptResponse[], IIgniteConceptBody>(endpoints.igniteConcept, form, this._handleAccessToken());
  // }
  // async getIgniteConcept(igniteId: string) {
  //   return this.get<IIgniteConceptSuccessResponse>(
  //     endpoints.specificIgniteConcept(igniteId),
  //     this._handleAccessToken()
  //   );
  // }
  // async deleteIgniteConcept(igniteId: string) {
  //   return this.delete<IIgniteConceptSuccessResponse>(endpoints.igniteConcept, this._handleAccessToken());
  // }
  // async getAllGeneratedConcepts(igniteId: string) {
  //   return this.get<IConceptResponse[]>(endpoints.specificConcept(igniteId), this._handleAccessToken());
  // }
  // async getConceptOverview(id: string) {
  //   return this.get<IConceptOverview>(endpoints.conceptOverview(id), this._handleAccessToken());
  // }
  // async getAllSavedConcepts() {
  //   return this.get<IConceptResponse[]>(endpoints.concept, this._handleAccessToken());
  // }
  // async getGeneratedConcept(id: string) {
  //   return this.get<IConceptResponse>(endpoints.specificConcept(id), this._handleAccessToken());
  // }
  // async saveGeneratedConcept(id: string) {
  //   return this.get<IConceptResponse>(endpoints.saveSpecificConcept(id), this._handleAccessToken());
  // }
  // async deleteGeneratedConcept(id: string) {
  //   return this.delete<IConceptResponse>(endpoints.specificConcept(id), this._handleAccessToken());
  // }
  // async deleteAllUnsavedGeneratedConcept(igniteId: string) {
  //   return this.delete<IMessageResponse>(endpoints.deleteUnsavedConcepts(igniteId), this._handleAccessToken());
  // }
  // async getTargetGroups(id: string) {
  //   return this.get<string[]>(endpoints.conceptTargetGroups(id), this._handleAccessToken());
  // }
  // async getCustomerProfile(id: string, group: string) {
  //   return this.get<IConceptCustomerProfile>(endpoints.conceptCustomerProfile(id, group), this._handleAccessToken());
  // }
}

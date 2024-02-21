import { ApiService } from './apiService';
import { endpoints } from './endpoints';
import { IDomainMarket, IGeneratedDomain, IIgniteDomainBody } from './typings/ignite-domain';

export class IgniteDomainApi extends ApiService {
  /** Ignite Domain
   *
   * @param form
   * @returns
   */
  // async generateDomain(form: IIgniteDomainBody) {
  //   return this.post<IGeneratedDomain, IIgniteDomainBody>(endpoints.igniteDomain, form, this._handleAccessToken());
  // }
  // async getAllDomains() {
  //   return this.get<IGeneratedDomain[]>(endpoints.domainAll, this._handleAccessToken());
  // }
  // async getDomainMarket(id: string) {
  //   return this.get<IDomainMarket>(endpoints.domainMarket(id), this._handleAccessToken());
  // }
  // async getDomain(id: string) {
  //   return this.get<IGeneratedDomain>(endpoints.domain(id), this._handleAccessToken());
  // }
}

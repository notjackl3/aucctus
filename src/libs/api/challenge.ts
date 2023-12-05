import { ApiService } from "./apiService";
import { endpoints } from "./endpoints";
import { IChallenge, IChallengeResponse } from "./typings/challenges";





export class ChallengeApi extends ApiService {

  async getChallenges() {
    return this.get<IChallengeResponse[]>(endpoints.challenge, this._handleAccessToken())
  }

  async getChallenge(id: string) {
    return this.get<any>(endpoints.challengeSpecific(id), this._handleAccessToken())
  }

  async createChallenge(form: IChallenge) {
    return this.post<IChallengeResponse, IChallenge>(endpoints.challenge, form, this._handleAccessToken())
  }

  async updateChallenge(id: string, form: IChallenge) {
    return this.put<IChallengeResponse, IChallenge>(endpoints.challengeSpecific(id), form, this._handleAccessToken())
  }

  async deleteChallenge(id: string) {
    return this.delete<IChallenge>(endpoints.challengeSpecific(id), this._handleAccessToken())
  }

}
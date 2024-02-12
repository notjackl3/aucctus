import { ApiService } from "./apiService";
import { endpoints } from "./endpoints";
import { IChallenge, IChallengeIdea, IChallengeIdeaResponse, IChallengeMetrics, IChallengeResponse } from "./typings/challenges";





export class ChallengeApi extends ApiService {

  // async getChallenges() {
  //   return this.get<IChallengeResponse[]>(endpoints.challenge, this._handleAccessToken())
  // }

  // async getChallenge(id: string) {
  //   return this.get<any>(endpoints.challengeSpecific(id), this._handleAccessToken())
  // }

  // async createChallenge(form: IChallenge) {
  //   return this.post<IChallengeResponse, IChallenge>(endpoints.challenge, form, this._handleAccessToken())
  // }

  // async updateChallenge(id: string, form: IChallenge) {
  //   return this.put<IChallengeResponse, IChallenge>(endpoints.challengeSpecific(id), form, this._handleAccessToken())
  // }

  // async deleteChallenge(id: string) {
  //   return this.delete<IChallenge>(endpoints.challengeSpecific(id), this._handleAccessToken())
  // }

  // async getChallengeMetrics(id: string) {
  //   return this.get<IChallengeMetrics>(endpoints.challengeMetrics(id), this._handleAccessToken())
  // }

  // async getIdea(id: string) {
  //   return this.get<IChallengeIdeaResponse>(endpoints.ideaSpecific(id), this._handleAccessToken())
  // }

  // async createIdea(challengeId: string, form: IChallengeIdea) {
  //   return this.post<IChallengeIdeaResponse, IChallengeIdea>(endpoints.idea(challengeId), form, this._handleAccessToken())
  // }

  // async updateIdea(id: string, form: IChallengeIdea) {
  //   return this.put<IChallengeIdeaResponse, IChallengeIdea>(endpoints.ideaSpecific(id), form, this._handleAccessToken())
  // }

  // async deleteIdea(id: string) {
  //   return this.delete<IChallengeIdeaResponse>(endpoints.ideaSpecific(id), this._handleAccessToken())
  // }

  // async getIdeas(challengeId: string) {
  //   return this.get<IChallengeIdeaResponse[]>(endpoints.idea(challengeId), this._handleAccessToken())
  // }

}
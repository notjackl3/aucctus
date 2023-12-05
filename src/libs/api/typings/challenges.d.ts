
export interface IChallenge {
  title: string;
  description: string;
  pains: string;
  q4: string;
  endDate: string;

}


export interface IChallengeResponse extends IChallenge {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
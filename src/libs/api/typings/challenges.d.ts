
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

export interface IChallengeMetrics {
  totalIdeas: number;
  uniqueUsers: number;
}

export interface IChallengeIdea {
  title: string;
  description: string;
}

export interface IChallengeIdeaResponse extends IChallengeIdea {
  id: string;
  userId: string
  createdAt: Date;
  updatedAt: Date;
}

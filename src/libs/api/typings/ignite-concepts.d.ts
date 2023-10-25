

export interface IIgniteConceptBody {

  // Describe your idea in one sentence*
  concept: string;

  // What and who’s pain point does it solve?
  painPoint: string;

  // How do you plan to monetize the idea?
  monetizationStrategy: string;

  // Why is your organization competitive to create this product?
  motivation: string;

  // Any other details you think are worth sharing?
  extraDetails: string
}

export interface IIgniteConceptSuccessResponse {
  id: string
  concept: string;
  painPoint: string;
  monetizationStrategy: string;
  motivation: string;
  extraDetails: string
  concepts: IConceptResponse[]
}




export interface IConceptResponse extends IConcepts {
  id: string;
  igniteConceptId: string;
  isSaved: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface IConcepts {
  title: string;
  summary: string;
  score: number
}




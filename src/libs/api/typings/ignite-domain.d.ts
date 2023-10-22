


export interface IIgniteDomainSuccessResponse {
  id: string;
  title: string;
  overview: string;
  whyThisIsAGoodIdea: string;
  totalAddressableMarket: IRate,
  compoundAnnualGrowth: IRate
  marketSegments: IMarketSegments[]
}

interface IRate {
  rate: number;
  overview: string;
}

interface IMarketSegments {
  title: string;
  rate: number;
  overview: string;
}

export interface IIgniteDomainBody {

  // What opportunity area are you looking to explore?
  opportunity: string;

  // Why do you believe there is opportunity in this area? 
  perception: string;

  // Why is your organization equipped to provide value in this area? 
  qualification: string;

  // Whats an example of specific concepts your organization could offer? 
  exampleConcepts: string;

  // Could you share any other details about your strategy and competitive advantages in this area?
  extraDetails: string
}
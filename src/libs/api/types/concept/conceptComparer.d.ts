export interface ICompareConceptsRequest {
  conceptUuids: string[];
}

export interface IConceptAnalysis {
  /** UUID of the concept */
  conceptUuid: string;
  /** Name of the concept */
  conceptName: string;
  /** 2-3 key strengths of this concept */
  pros: string[];
  /** 2-3 key weaknesses or concerns */
  cons: string[];
  /** 1-2 unknowns or risks */
  unknowns: string[];
  /** Brief recommendation for this concept */
  recommendation: string;
  /** Note about data completeness if the concept has missing sections */
  completenessNote: string;
}

export interface IConceptComparisonWinner {
  /** UUID of the winning concept */
  conceptUuid: string;
  /** Name of the winning concept */
  conceptName: string;
  /** Detailed justification for why this concept was selected as the winner */
  justification: string;
}

export interface ICompareConceptsResponse {
  /** Comparison analysis for each concept */
  concepts: IConceptAnalysis[];
  /** The winning concept with justification */
  winner: IConceptComparisonWinner;
}

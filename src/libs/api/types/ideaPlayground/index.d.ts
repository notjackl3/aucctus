/**
 * Idea Playground API Types
 *
 * These types define the data structures for the Idea Playground feature,
 * which helps users generate innovative concepts through guided questioning.
 */

/**
 * Anchor Thought - A pre-generated seed idea to start the ideation process
 */
export interface IAnchorThought {
  uuid: string;
  thought: string;
  createdAt: string;
}

/**
 * Response for fetching anchor thoughts
 */
export interface IAnchorThoughtsResponse {
  results: IAnchorThought[];
}

/**
 * Request to create a new seed with an anchor thought
 */
export interface ICreateSeedRequest {
  thought_text: string;
}

/**
 * Response after creating a seed
 */
export interface ICreateSeedResponse {
  seedUuid: string;
  anchorThought: IAnchorThought;
}

/**
 * Question types for guiding idea exploration
 */
export type QuestionType = 'WHY' | 'WHO' | 'WHAT' | 'HOW';

/**
 * Anchor Question - Questions generated to guide idea exploration
 * Extended to include all associated answers and selection state
 */
export interface IAnchorQuestion {
  uuid: string;
  seedUuid?: string;
  question: string;
  questionType: QuestionType;
  description: string;
  possibleAnswers?: IPossibleAnswer[];
  researchInsights?: IResearchInsight[];
  userAnswer?: IUserAnswer | null; // Single user answer per question
  includedAnswers?: string[]; // UUIDs of answers that are selected/included for this question
  createdAt?: string;
}

/**
 * Response for fetching questions
 */
export interface IQuestionsResponse {
  questions: IAnchorQuestion[];
}

/**
 * Possible Answer - AI-generated answer suggestion
 */
export interface IPossibleAnswer {
  uuid: string;
  questionUuid: string;
  answer: string;
  createdAt: string;
}

/**
 * Source metadata for research insights
 */
export interface ISimpleSource {
  url: string;
  title: string;
  credibility: number;
}

/**
 * Why It Matters analysis for insights
 */
export interface IWhyItMatters {
  goodNews: string;
  badNews: string;
}

/**
 * Research Insight - AI-generated insight with source validation
 * Backend returns flat source fields (sourceUrl, sourceTitle, sourceCredibility)
 */
export interface IResearchInsight {
  uuid: string;
  questionUuid: string;
  insight: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceCredibility: number;
  moreDetails?: string | null;
  whyItMatters?: IWhyItMatters | null;
  createdAt?: string;
}

/**
 * User Answer - Custom user-provided answer
 */
export interface IUserAnswer {
  uuid: string;
  questionUuid: string;
  answer: string;
  createdAt: string;
}

/**
 * Request to create a user answer
 */
export interface ICreateUserAnswerRequest {
  answer: string;
}

/**
 * Concept types for categorizing generated ideas
 */
export type ConceptType = 'Core' | 'Adjacent' | 'Disruptive';

/**
 * Generated Idea Playground Concept
 */
export interface IGeneratedIdeaPlaygroundConcept {
  uuid: string;
  seedUuid: string;
  title: string;
  description: string;
  conceptType: ConceptType;
  rationale: string;
  problemItSolves: string;
  uniqueValueProposition: string;
  reasonsToBelieve: string[]; // 3-4 bullet points (each 5-10 words)
  reasonsToChallenge: string[]; // 3-4 bullet points (each 5-10 words)
  keyThingsToValidate: string[]; // 3-4 bullet points (each 5-10 words)
  createdAt: string;
}

/**
 * Response for fetching generated concepts (GET endpoint)
 */
export interface IIdeaPlaygroundGeneratedConceptsResponse {
  results: IGeneratedIdeaPlaygroundConcept[];
}

/**
 * Response from generate-ideas endpoint (POST endpoint)
 * Returns all concepts and organized by type
 */
export interface IIdeaPlaygroundGenerateIdeasResponse {
  concepts: IGeneratedIdeaPlaygroundConcept[];
  core_concepts: IGeneratedIdeaPlaygroundConcept[];
  adjacent_concepts: IGeneratedIdeaPlaygroundConcept[];
  disruptive_concepts: IGeneratedIdeaPlaygroundConcept[];
}

/**
 * Request to save selected concepts
 */
export interface ISaveConceptsRequest {
  conceptUuids: string[];
}

/**
 * Generation in progress response (202 Accepted)
 */
export interface IGenerationInProgress {
  status: 'generating';
  message: string;
}

/**
 * Union type for endpoints that may return data or generation status
 */
export type IPossibleAnswerResponse = IPossibleAnswer | IGenerationInProgress;
export type IResearchInsightsResponse =
  | IResearchInsight[]
  | IGenerationInProgress;
export type IConceptGenerationResponse =
  | IIdeaPlaygroundGenerateIdeasResponse
  | IGenerationInProgress;

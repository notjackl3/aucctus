/**
 * Idea Playground API Types
 *
 * These types define the data structures for the Idea Playground feature,
 * which helps users generate innovative concepts through guided questioning.
 */

/**
 * Anchor Thought - A pre-generated seed idea to start the ideation process
 * Basic version without nested questions (used during ideation flow)
 */
export interface IAnchorThought {
  uuid: string;
  thought: string;
  title: string;
  createdAt: string;
}

/**
 * Simple Source - Basic source info for research insights in saved seeds
 * Used in the nested anchor thought structure returned from seed endpoint
 */
export interface ISimpleSavedSource {
  uuid: string;
  url?: string;
  title?: string;
  credibility: number;
}

/**
 * Saved Research Insight - Research insight with nested source object
 * Used in saved seed responses (different from IResearchInsight which has flat source fields)
 */
export interface ISavedResearchInsight {
  uuid: string;
  insight: string;
  moreDetails?: string | null;
  source: ISimpleSavedSource;
}

/**
 * Saved Possible Answer - AI-generated answer in saved seed
 */
export interface ISavedPossibleAnswer {
  uuid: string;
  answer: string;
}

/**
 * Saved User Answer - User's custom answer in saved seed
 */
export interface ISavedUserAnswer {
  uuid: string;
  answer: string;
}

/**
 * Saved Anchor Question - Question with all nested data from saved seed
 * This is the structure returned when fetching a saved IDEA_PLAYGROUND seed
 */
export interface ISavedAnchorQuestion {
  uuid: string;
  question: string;
  questionType: string;
  description?: string;
  possibleAnswers: ISavedPossibleAnswer[];
  researchInsights: ISavedResearchInsight[];
  userAnswers: ISavedUserAnswer[];
}

/**
 * Anchor Thought with Questions - Full nested structure for saved seeds
 * Returned by GET /api/v2/concept/seed/{uuid} for IDEA_PLAYGROUND seeds
 */
export interface IAnchorThoughtWithQuestions {
  uuid: string;
  thought: string;
  questions: ISavedAnchorQuestion[];
  createdAt?: string | null;
  updatedAt?: string | null;
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
  living_persona_uuids?: string[];
}

/**
 * Seed File - Uploaded file associated with a seed
 */
export interface ISeedFile {
  uuid: string;
  fileType: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

/**
 * Response after creating a seed
 */
export interface ICreateSeedResponse {
  seedUuid: string;
  anchorThought: IAnchorThought;
  title?: string;
  file?: ISeedFile | null;
  livingPersonaUuids?: string[];
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
  nucleusInsights?: INucleusInsight[];
  insights?: IResearchInsight[];
  userAnswers: IUserAnswer[]; // User answers for this question (max 3)
  includedAnswers?: string[]; // UUIDs of answers that are selected/included for this question
  isCustomQuestion?: boolean; // True if user-created, false/undefined if AI-generated
  createdAt?: string;
  // Pipeline status flags
  hasPossibleAnswerGenerated?: boolean; // Whether possible answer pipeline has completed
  hasInsightsGenerated?: boolean; // Whether insights pipeline has completed
  isGeneratingPossibleAnswer?: boolean; // Whether possible answer generation is in progress
  isGeneratingInsights?: boolean; // Whether insights generation is in progress
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
 * Citation validation status for research insights
 */
export type CitationValidationStatus = 'pending' | 'success' | 'error';

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
  citationValidationStatus?: CitationValidationStatus;
  createdAt?: string;
  sentiment: 'headwind' | 'tailwind' | 'neutral';
}

/**
 * Nucleus Insight - AI-generated insight from Nucleus database
 */
export interface INucleusInsight {
  uuid: string;
  questionUuid: string;
  insight: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceCredibility: number;
  moreDetails?: string | null;
  whyItMatters?: IWhyItMatters | null;
  citationValidationStatus?: CitationValidationStatus;
  createdAt?: string;
  sentiment: 'headwind' | 'tailwind' | 'neutral';
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
  /** Icon that best represents the concept - assigned by AI based on concept's domain/mechanism */
  icon?: string | null;
  rationale: string;
  initialGutCheck?: string;
  problemItSolves: string;
  uniqueValueProposition: string;
  reasonsToBelieve: string[]; // 3-4 bullet points (each 5-10 words)
  reasonsToChallenge: string[]; // 3-4 bullet points (each 5-10 words)
  alignment: string[]; // 2-4 bullet points showing strategic fit with company priorities
  momentumScore?: string; // "1-3" score representing idea momentum (Early/Emerging/High)
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
  /** Whether "generate more" is currently in progress */
  generatingMore?: boolean;
}

/**
 * Request to save selected concepts
 */
export interface ISaveConceptsRequest {
  conceptUuids: string[];
  livingPersonaUuids?: string[];
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
 * Note: generate_possible_answer endpoint returns an array of all existing possible answers
 */
export type IPossibleAnswerResponse = IPossibleAnswer[] | IGenerationInProgress;
export type IResearchInsightsResponse =
  | IResearchInsight[]
  | IGenerationInProgress;
export type INucleusInsightsResponse =
  | INucleusInsight[]
  | IGenerationInProgress;
export type IConceptGenerationResponse =
  | IIdeaPlaygroundGenerateIdeasResponse
  | IGenerationInProgress;

/**
 * Seed Context - Debug response containing all context for a seed
 */
export interface ISeedContextResponse {
  seed_uuid: string;
  seed_title: string;
  anchor_thought: string;
  company_context: string;
  questions_context: string;
  generated_concepts: {
    uuid: string;
    title: string;
    description: string;
    concept_type: string;
  }[];
  question_count: number;
  answered_question_count: number;
}

/**
 * Bulk Update Questions - Request types for restoring/updating all questions at once
 */
export interface IBulkPossibleAnswer {
  uuid: string;
  answer: string;
}

export interface IBulkInsight {
  uuid: string;
  insight: string;
  source_type: 'research' | 'nucleus';
  source_url?: string;
  source_title?: string;
  source_credibility?: number;
  sentiment?: 'headwind' | 'tailwind' | 'neutral';
  more_details?: string | null;
  why_it_matters?: IWhyItMatters | null;
  citation_validation_status?: CitationValidationStatus;
}

export interface IBulkUserAnswer {
  uuid: string;
  answer: string;
}

export interface IBulkQuestion {
  uuid: string;
  question: string;
  question_type: string;
  description?: string;
  possible_answers?: IBulkPossibleAnswer[];
  research_insights?: IBulkInsight[];
  nucleus_insights?: IBulkInsight[];
  combined_insights?: IBulkInsight[];
  user_answers: IBulkUserAnswer[];
  included_answers?: string[];
  is_custom_question?: boolean;
}

export interface IBulkUpdateQuestionsRequest {
  questions: IBulkQuestion[];
}

export interface IBulkUpdateQuestionsResponse {
  questions: IAnchorQuestion[];
}

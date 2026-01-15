/**
 * Types for Scoring Configuration API
 */

export type Importance = 'low' | 'medium' | 'high';

export interface IScoringQuestion {
  uuid: string;
  text: string;
  importance: Importance;
  order: number;
  isActive: boolean;
}

export interface IScoringQuestionCreate {
  text: string;
  importance?: Importance;
  order?: number;
}

export interface IScoringQuestionUpdate {
  uuid: string;
  text?: string;
  importance?: Importance;
  order?: number;
  isActive?: boolean;
}

export interface IScoringCategory {
  uuid: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
  questions: IScoringQuestion[];
}

export interface IScoringCategoryCreate {
  name: string;
  icon?: string;
  order?: number;
  questions?: IScoringQuestionCreate[];
}

export interface IScoringCategoryUpdate {
  uuid: string;
  name?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  questions?: IScoringQuestionUpdate[];
  newQuestions?: IScoringQuestionCreate[];
}

export interface IScoringConfig {
  categories: IScoringCategory[];
  currentVersion: number | null;
  totalQuestions: number;
}

export interface IScoringConfigSave {
  categories: (IScoringCategoryCreate | IScoringCategoryUpdate)[];
  rescoreAll?: boolean;
  deletedCategoryUuids?: string[];
  deletedQuestionUuids?: string[];
}

export interface IScoringConfigSaveResponse {
  success: boolean;
  message: string;
  version: number | null;
  rescoreTaskId: string | null;
}

// Priority Score Types (for scoring results)

export interface IQuestionScore {
  questionUuid: string;
  questionText: string;
  categoryName: string;
  score: number; // 1-5
  reasoning: string;
  importance: Importance; // low, medium, high
  isAiGenerated: boolean;
}

export interface ICategoryScore {
  categoryUuid: string;
  categoryName: string;
  categoryIcon: string;
  score: number; // Sum of question scores (each 1-5)
  maxScore: number; // Maximum possible score (questions × 5)
  questions: IQuestionScore[];
}

export type InnovationHorizon = 'core' | 'adjacent' | 'disruptive';

export interface IConceptPriorityDetail {
  conceptUuid: string;
  overallScore: number; // 0-100
  overallReasoning: string;
  priorityLevel: string;
  categoryScores: ICategoryScore[];
  isAiGenerated: boolean;
  scoringConfigVersion: number | null;
  // Innovation horizon classification
  innovationHorizon?: InnovationHorizon | null;
  innovationHorizonReasoning?: string;
  // AI-generated strategic assessment
  reasonsToBelieve: string[];
  reasonsToChallenge: string[];
  updatedAt: string;
}

export interface IQuestionScoreUpdate {
  questionUuid: string;
  score: number; // 1-5
  reasoning?: string;
}

export interface IQuestionScoreUpdateResponse {
  success: boolean;
  questionUuid: string;
  newScore: number;
  categoryScore: number;
  categoryMaxScore: number;
  overallScore: number;
  message: string;
}

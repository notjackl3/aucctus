import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IAnchorThought,
  IAnchorQuestion,
  IPossibleAnswer,
  IResearchInsight,
  INucleusInsight,
  IUserAnswer,
  IGeneratedIdeaPlaygroundConcept,
  ICreateSeedRequest,
  ICreateSeedResponse,
  IQuestionsResponse,
  IIdeaPlaygroundGeneratedConceptsResponse,
  IIdeaPlaygroundGenerateIdeasResponse,
  ISaveConceptsRequest,
  IPossibleAnswerResponse,
  IResearchInsightsResponse,
  INucleusInsightsResponse,
  IConceptGenerationResponse,
  IGenerationInProgress,
  ISeedContextResponse,
  IBulkUpdateQuestionsRequest,
  IBulkUpdateQuestionsResponse,
} from './types';

export type { IGenerationInProgress } from './types/ideaPlayground';

/**
 * Idea Playground API
 *
 * Handles all requests for the Idea Playground feature.
 */
export class IdeaPlaygroundApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
  }

  /**
   * Get 6 AI-generated anchor thoughts for the user's company
   * Cached for 30 minutes on backend
   */
  getAnchorThoughts(): Promise<IAnchorThought[]> {
    return this.get<{ thoughts: IAnchorThought[] }>(
      endpoints.ideaPlaygroundAnchorThoughts,
    ).then((response) => response.thoughts);
  }

  /**
   * Create a new seed with an anchor thought
   * @param thoughtText - The anchor thought text
   * @param file - Optional file to upload (max 10MB, supports PDF, DOCX, TXT, HTML, XLSX, CSV, PPTX, PNG, JPG, WEBP, GIF, MP3, WAV, MP4, MOV)
   */
  createSeedWithThought(
    thoughtText: string,
    file?: File,
  ): Promise<ICreateSeedResponse> {
    if (file) {
      // Use multipart/form-data for file upload
      const formData = new FormData();
      formData.append('thought_text', thoughtText);
      formData.append('file', file);

      return this.postFormData<ICreateSeedResponse>(
        endpoints.ideaPlaygroundSeedWithFile,
        formData,
      );
    }

    // No file - use JSON body
    const payload: ICreateSeedRequest = { thought_text: thoughtText };
    return this.post<ICreateSeedResponse, ICreateSeedRequest>(
      endpoints.ideaPlaygroundSeed,
      payload,
    );
  }

  /**
   * Get the anchor thought for a specific seed
   * Returns the anchor thought that was used to create this seed
   */
  getAnchorThoughtForSeed(seedUuid: string): Promise<IAnchorThought> {
    return this.get<IAnchorThought>(
      endpoints.ideaPlaygroundSeedAnchorThought(seedUuid),
    );
  }

  /**
   * Get 4 anchor questions (WHY, WHO, WHAT, HOW) for a seed
   * Generated on first request, then cached
   */
  getQuestions(seedUuid: string): Promise<IAnchorQuestion[]> {
    return this.get<IQuestionsResponse>(
      endpoints.ideaPlaygroundSeedQuestions(seedUuid),
    ).then((response) => response.questions);
  }

  /**
   * Add a custom question to a seed
   * The question type will be resolved via LLM on the backend
   * @param seedUuid - The seed UUID
   * @param question - The question text (1-500 chars)
   * @param description - Optional description (max 1000 chars)
   */
  addCustomQuestion(
    seedUuid: string,
    question: string,
    description?: string,
  ): Promise<IAnchorQuestion> {
    return this.post<
      IAnchorQuestion,
      { question: string; description?: string }
    >(endpoints.ideaPlaygroundSeedQuestions(seedUuid), {
      question,
      description,
    });
  }

  /**
   * Delete a custom question from a seed
   * Only custom questions (isCustomQuestion: true) can be deleted
   * Returns 400 error with code 'cannot_delete_ai_question' if attempting to delete AI-generated question
   * @param seedUuid - The seed UUID
   * @param questionUuid - The question UUID to delete
   */
  deleteCustomQuestion(seedUuid: string, questionUuid: string): Promise<void> {
    return this.delete<void>(
      endpoints.ideaPlaygroundDeleteQuestion(seedUuid, questionUuid),
    );
  }

  /**
   * Generate a possible answer for a specific question
   * Returns 202 Accepted if generation is in progress
   */
  generatePossibleAnswer(
    seedUuid: string,
    questionUuid: string,
  ): Promise<IPossibleAnswerResponse> {
    return this.post<IPossibleAnswerResponse>(
      endpoints.ideaPlaygroundPossibleAnswer(seedUuid, questionUuid),
    );
  }

  /**
   * Generate 4 research insights using Perplexity AI
   * Citation validation happens asynchronously in background
   * Returns 202 Accepted if generation is in progress
   */
  generateResearchInsights(
    seedUuid: string,
    questionUuid: string,
  ): Promise<IResearchInsightsResponse> {
    return this.post<IResearchInsightsResponse>(
      endpoints.ideaPlaygroundResearchInsights(seedUuid, questionUuid),
    );
  }

  /**
   * Add a user's own answer to a question
   * User answers are automatically included when created
   */
  addUserAnswer(
    seedUuid: string,
    questionUuid: string,
    answer: string,
  ): Promise<IUserAnswer> {
    return this.post<IUserAnswer, { answer: string }>(
      endpoints.ideaPlaygroundUserAnswer(seedUuid, questionUuid),
      { answer },
    );
  }

  /**
   * Include an answer (PossibleAnswer or ResearchInsight) for a question
   * Adds the answer UUID to the question's included_answers list
   */
  includeAnswer(
    seedUuid: string,
    questionUuid: string,
    answerUuid: string,
  ): Promise<void> {
    return this.post<void>(
      endpoints.ideaPlaygroundIncludeAnswer(seedUuid, questionUuid, answerUuid),
    );
  }

  /**
   * Exclude an answer (PossibleAnswer or ResearchInsight) from a question
   * Removes the answer UUID from the question's included_answers list
   * Does not delete the answer itself
   */
  excludeAnswer(
    seedUuid: string,
    questionUuid: string,
    answerUuid: string,
  ): Promise<void> {
    return this.delete<void>(
      endpoints.ideaPlaygroundExcludeAnswer(seedUuid, questionUuid, answerUuid),
    );
  }

  /**
   * Remove the user's answer from a question entirely
   * Deletes the single user answer for the question
   */
  removeUserAnswer(seedUuid: string, questionUuid: string): Promise<void> {
    return this.delete<void>(
      endpoints.ideaPlaygroundRemoveUserAnswer(seedUuid, questionUuid),
    );
  }

  /**
   * Generate 9 concepts (Core/Adjacent/Disruptive) based on answered questions
   * Returns cached concepts if available, or starts background generation task and returns 202 Accepted
   * @param seedUuid - The seed UUID
   * @param forceRegenerate - If true, regenerates concepts even if cached
   */
  generateIdeas(
    seedUuid: string,
    forceRegenerate?: boolean,
  ): Promise<IConceptGenerationResponse> {
    return this.post<IConceptGenerationResponse>(
      endpoints.ideaPlaygroundGenerateIdeas(seedUuid),
      forceRegenerate ? { force_regenerate: true } : undefined,
    );
  }

  /**
   * Get generated concepts for a seed without triggering generation
   * Returns cached concepts if available, 202 Accepted if generation is in progress, or empty arrays if no concepts
   * @param seedUuid - The seed UUID
   */
  getGeneratedIdeas(seedUuid: string): Promise<IConceptGenerationResponse> {
    return this.get<IConceptGenerationResponse>(
      endpoints.ideaPlaygroundGeneratedIdeas(seedUuid),
    );
  }

  /**
   * Delete a generated concept from the cached concepts
   * Removes a single concept from the seed's generated concepts list
   * @param seedUuid - The seed UUID
   * @param conceptUuid - The concept UUID to delete
   */
  deleteGeneratedConcept(seedUuid: string, conceptUuid: string): Promise<void> {
    return this.delete<void>(
      endpoints.ideaPlaygroundDeleteGeneratedConcept(seedUuid, conceptUuid),
    );
  }

  /**
   * Generate 4 additional concepts that are different from existing ones
   * Returns 202 Accepted and starts background generation task
   * Client will receive WebSocket notification when generation completes
   * @param seedUuid - The seed UUID
   */
  generateMoreIdeas(seedUuid: string): Promise<IGenerationInProgress> {
    return this.post<IGenerationInProgress>(
      endpoints.ideaPlaygroundGenerateMoreIdeas(seedUuid),
    );
  }

  /**
   * Regenerate concepts based on user feedback
   * Takes user feedback and generates a fresh set of 4 concepts that address the feedback,
   * replacing the existing cached concepts.
   * Returns 202 Accepted and starts background generation task
   * Client will receive WebSocket notification when generation completes
   * @param seedUuid - The seed UUID
   * @param feedback - User feedback to guide regeneration (1-1000 characters)
   */
  regenerateIdeasWithFeedback(
    seedUuid: string,
    feedback: string,
  ): Promise<IGenerationInProgress> {
    return this.post<IGenerationInProgress, { feedback: string }>(
      endpoints.ideaPlaygroundRegenerateIdeasWithFeedback(seedUuid),
      { feedback },
    );
  }

  /**
   * Get generated concepts for a seed
   */
  getConcepts(seedUuid: string): Promise<IGeneratedIdeaPlaygroundConcept[]> {
    return this.get<IIdeaPlaygroundGeneratedConceptsResponse>(
      endpoints.ideaPlaygroundConcepts(seedUuid),
    ).then((response) => response.results);
  }

  /**
   * Save selected concepts to database
   */
  saveConcepts(seedUuid: string, conceptUuids: string[]): Promise<void> {
    const payload: ISaveConceptsRequest = { conceptUuids };
    return this.post<void, ISaveConceptsRequest>(
      endpoints.ideaPlaygroundSaveConcepts(seedUuid),
      payload,
    );
  }

  /**
   * Get seed context for debugging
   * Returns all context used for concept generation including anchor thought,
   * questions, answers, and generated concepts
   */
  getSeedContext(seedUuid: string): Promise<ISeedContextResponse> {
    return this.get<ISeedContextResponse>(
      endpoints.ideaPlaygroundSeedContext(seedUuid),
    );
  }

  /**
   * Bulk update all questions for a seed
   * Replaces the cached questions with the provided list
   * Used for reverting to a previous state or batch updates
   * @param seedUuid - The seed UUID
   * @param questions - Complete list of questions to replace cache
   */
  bulkUpdateQuestions(
    seedUuid: string,
    request: IBulkUpdateQuestionsRequest,
  ): Promise<IAnchorQuestion[]> {
    return this.put<IBulkUpdateQuestionsResponse, IBulkUpdateQuestionsRequest>(
      endpoints.ideaPlaygroundSeedQuestions(seedUuid),
      request,
    ).then((response) => response.questions);
  }
}

// Type guard helpers
export function isGenerationInProgress(
  response: any,
): response is IGenerationInProgress {
  return response && response.status === 'generating';
}

export function isPossibleAnswers(
  response: IPossibleAnswerResponse,
): response is IPossibleAnswer[] {
  return Array.isArray(response);
}

/**
 * @deprecated Use isPossibleAnswers (plural) instead - endpoint now returns an array
 */
export function isPossibleAnswer(
  response: IPossibleAnswerResponse,
): response is IPossibleAnswer[] {
  return isPossibleAnswers(response);
}

export function isResearchInsights(
  response: IResearchInsightsResponse,
): response is IResearchInsight[] {
  return Array.isArray(response);
}

export function isNucleusInsights(
  response: INucleusInsightsResponse,
): response is INucleusInsight[] {
  return Array.isArray(response);
}

export function isConceptGenerationComplete(
  response: IConceptGenerationResponse,
): response is IIdeaPlaygroundGenerateIdeasResponse {
  return !isGenerationInProgress(response);
}

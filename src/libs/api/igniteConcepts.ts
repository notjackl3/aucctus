import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ConceptIgnitionQuestion,
  ConceptIgnitionQuestionnaireType,
  IConceptIgnitionQuestionnaire,
  IGeneratedConcept,
  QuestionIdentifier,
} from './types'; // Import the missing type

/**
 * Concept Ignite API
 *
 * Handles all the requests to the fast service for concept generation.
 */
export interface IConceptGenerateResponse {
  concepts: IGeneratedConcept[];
}

export interface IIgnitionAnswer {
  answer: string;
  fieldType: ConceptIgnitionQuestion['fieldType'];
  details?: string;
  questionId: number;
}

export interface IIgniteConceptBody {
  numberOfConcepts?: number;
  type: ConceptIgnitionQuestionnaireType;
  answers: { [key in QuestionIdentifier]?: IIgnitionAnswer };
}

export class IgniteConceptApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  ignite(body: IIgniteConceptBody) {
    return this.post<IConceptGenerateResponse>(endpoints.conceptIgnite, body);
  }

  questionnaire() {
    return this.get<IConceptIgnitionQuestionnaire>(
      endpoints.conceptQuestionnaire,
    );
  }
}

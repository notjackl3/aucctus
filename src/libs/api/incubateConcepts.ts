import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type {
  IClarifyingQuestion,
  IConcept,
  IConceptIncubationQuestionnaire,
  IGeneratedConcept,
} from './types';

export class IncubateConceptApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware(); // Rebind interceptor functions
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  generateClarifyingQuestions(uuid: string, conceptUuid?: string) {
    return this.post<IClarifyingQuestion[]>(
      endpoints.conceptIncubationSeedUuidClarifyingQuestions(uuid),
      { conceptUuid: conceptUuid },
    );
  }

  questionnaire() {
    return this.get<IConceptIncubationQuestionnaire>(
      endpoints.conceptQuestionnaire,
    );
  }

  abortableQuestionnaire() {
    return this.abortableGet<IConceptIncubationQuestionnaire>(
      endpoints.conceptQuestionnaire,
    );
  }

  saveGeneratedConcept(seedUuid: string, concepts: IGeneratedConcept[]) {
    return this.post<IConcept[], IGeneratedConcept[]>(
      endpoints.saveGeneratedConcept(seedUuid),
      concepts,
    );
  }
}

import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import type { IPageResponse } from './types/osiris';
import type {
  IPersona,
  IPersonaListItem,
  ICreatePersonaPayload,
  IUpdatePersonaPayload,
  IPersonaTag,
  ICreateTagPayload,
  IPersonaDemographics,
  IUpdateDemographicsPayload,
  IPersonaJobToBeDone,
  ICreateJobToBeDonePayload,
  IUpdateJobToBeDonePayload,
  IPersonaPain,
  ICreatePainPayload,
  IUpdatePainPayload,
  IPersonaGain,
  ICreateGainPayload,
  IUpdateGainPayload,
  IPersonaSocialValue,
  ICreateSocialValuePayload,
  IUpdateSocialValuePayload,
  IPersonaMotivation,
  ICreateMotivationPayload,
  IUpdateMotivationPayload,
  IPersonaBehaviour,
  ICreateBehaviourPayload,
  IUpdateBehaviourPayload,
  IPersonaKeyFact,
  ICreateKeyFactPayload,
  IUpdateKeyFactPayload,
  IPersonaQuote,
  ICreateQuotePayload,
  IUpdateQuotePayload,
  IPersonaWorkdayStep,
  ICreateWorkdayStepPayload,
  IUpdateWorkdayStepPayload,
  IPersonaChartData,
  ICreateChartDataPayload,
  IUpdateChartDataPayload,
  IReorderItemsPayload,
  ITrainingDocument,
  ITrainingDocumentUploadResponse,
  IEvidence,
  IEvidenceActionResponse,
  IChatSession,
  IChatSessionDetail,
  IStarterPromptsResponse,
  IMentionSearchResponse,
  IPersonaConversationSearchResponse,
  IMessageResponse,
  ICustomWidget,
  ICreateCustomWidgetPayload,
  IUpdateCustomWidgetPayload,
  ITaggedConcept,
} from './types/persona';

/**
 * Convert a camelCase key to snake_case.
 * e.g., "widgetType" -> "widget_type", "initialItems" -> "initial_items"
 */
function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert all keys in an object (or array of objects) from camelCase to snake_case.
 * Needed because Django Ninja schemas use snake_case field names for input parsing.
 */
function toSnakeCaseKeys<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCaseKeys(item)) as T;
  }
  if (
    obj !== null &&
    typeof obj === 'object' &&
    !(obj instanceof FormData) &&
    !(obj instanceof Blob)
  ) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        camelToSnake(key),
        toSnakeCaseKeys(value),
      ]),
    ) as T;
  }
  return obj;
}

/**
 * Persona API
 *
 * Handles all requests for Living Personas functionality.
 */
export class PersonaApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Persona CRUD
  // ============================================

  /**
   * Get all personas for the account.
   */
  getPersonas() {
    return this.get<IPersonaListItem[]>(endpoints.personas);
  }

  /**
   * Get a single persona with all nested data.
   */
  getPersona(personaUuid: string) {
    return this.get<IPersona>(endpoints.persona(personaUuid));
  }

  /**
   * Get concepts tagged with a specific persona (paginated).
   */
  getTaggedConcepts(personaUuid: string, page: number = 1, pageSize?: number) {
    return this.get<IPageResponse<ITaggedConcept>>(
      endpoints.personaTaggedConcepts(personaUuid, page, pageSize),
    );
  }

  /**
   * Create a new persona.
   */
  createPersona(data: ICreatePersonaPayload) {
    return this.post<IPersona, ICreatePersonaPayload>(endpoints.personas, data);
  }

  /**
   * Update a persona.
   */
  updatePersona(personaUuid: string, data: IUpdatePersonaPayload) {
    return this.patch<IPersona, IUpdatePersonaPayload>(
      endpoints.persona(personaUuid),
      data,
    );
  }

  /**
   * Delete (soft delete) a persona.
   */
  deletePersona(personaUuid: string) {
    return this.delete<IMessageResponse>(endpoints.persona(personaUuid));
  }

  // ============================================
  // Tags
  // ============================================

  /**
   * Add a tag to a persona.
   */
  addTag(personaUuid: string, data: ICreateTagPayload) {
    return this.post<IPersonaTag[], ICreateTagPayload>(
      endpoints.personaTags(personaUuid),
      data,
    );
  }

  /**
   * Remove a tag from a persona.
   */
  removeTag(personaUuid: string, tagUuid: string) {
    return this.delete<IMessageResponse>(
      endpoints.personaTag(personaUuid, tagUuid),
    );
  }

  // ============================================
  // Demographics
  // ============================================

  /**
   * Update persona demographics.
   */
  updateDemographics(personaUuid: string, data: IUpdateDemographicsPayload) {
    return this.patch<IPersonaDemographics, IUpdateDemographicsPayload>(
      endpoints.personaDemographics(personaUuid),
      data,
    );
  }

  // ============================================
  // Jobs to be Done
  // ============================================

  addJob(personaUuid: string, data: ICreateJobToBeDonePayload) {
    return this.post<IPersonaJobToBeDone[], ICreateJobToBeDonePayload>(
      endpoints.personaJobs(personaUuid),
      data,
    );
  }

  updateJob(
    personaUuid: string,
    jobUuid: string,
    data: IUpdateJobToBeDonePayload,
  ) {
    return this.patch<IPersonaJobToBeDone[], IUpdateJobToBeDonePayload>(
      endpoints.personaJob(personaUuid, jobUuid),
      data,
    );
  }

  deleteJob(personaUuid: string, jobUuid: string) {
    return this.delete<IPersonaJobToBeDone[]>(
      endpoints.personaJob(personaUuid, jobUuid),
    );
  }

  reorderJobs(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaJobToBeDone[], IReorderItemsPayload>(
      endpoints.personaJobsReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Pain Points
  // ============================================

  addPain(personaUuid: string, data: ICreatePainPayload) {
    return this.post<IPersonaPain[], ICreatePainPayload>(
      endpoints.personaPains(personaUuid),
      data,
    );
  }

  updatePain(personaUuid: string, painUuid: string, data: IUpdatePainPayload) {
    return this.patch<IPersonaPain[], IUpdatePainPayload>(
      endpoints.personaPain(personaUuid, painUuid),
      data,
    );
  }

  deletePain(personaUuid: string, painUuid: string) {
    return this.delete<IPersonaPain[]>(
      endpoints.personaPain(personaUuid, painUuid),
    );
  }

  reorderPains(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaPain[], IReorderItemsPayload>(
      endpoints.personaPainsReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Gains
  // ============================================

  addGain(personaUuid: string, data: ICreateGainPayload) {
    return this.post<IPersonaGain[], ICreateGainPayload>(
      endpoints.personaGains(personaUuid),
      data,
    );
  }

  updateGain(personaUuid: string, gainUuid: string, data: IUpdateGainPayload) {
    return this.patch<IPersonaGain[], IUpdateGainPayload>(
      endpoints.personaGain(personaUuid, gainUuid),
      data,
    );
  }

  deleteGain(personaUuid: string, gainUuid: string) {
    return this.delete<IPersonaGain[]>(
      endpoints.personaGain(personaUuid, gainUuid),
    );
  }

  reorderGains(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaGain[], IReorderItemsPayload>(
      endpoints.personaGainsReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Social Values
  // ============================================

  addSocialValue(personaUuid: string, data: ICreateSocialValuePayload) {
    return this.post<IPersonaSocialValue[], ICreateSocialValuePayload>(
      endpoints.personaSocialValues(personaUuid),
      data,
    );
  }

  updateSocialValue(
    personaUuid: string,
    valueUuid: string,
    data: IUpdateSocialValuePayload,
  ) {
    return this.patch<IPersonaSocialValue[], IUpdateSocialValuePayload>(
      endpoints.personaSocialValue(personaUuid, valueUuid),
      data,
    );
  }

  deleteSocialValue(personaUuid: string, valueUuid: string) {
    return this.delete<IPersonaSocialValue[]>(
      endpoints.personaSocialValue(personaUuid, valueUuid),
    );
  }

  reorderSocialValues(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaSocialValue[], IReorderItemsPayload>(
      endpoints.personaSocialValuesReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Motivations
  // ============================================

  addMotivation(personaUuid: string, data: ICreateMotivationPayload) {
    return this.post<IPersonaMotivation[], ICreateMotivationPayload>(
      endpoints.personaMotivations(personaUuid),
      data,
    );
  }

  updateMotivation(
    personaUuid: string,
    motivationUuid: string,
    data: IUpdateMotivationPayload,
  ) {
    return this.patch<IPersonaMotivation[], IUpdateMotivationPayload>(
      endpoints.personaMotivation(personaUuid, motivationUuid),
      data,
    );
  }

  deleteMotivation(personaUuid: string, motivationUuid: string) {
    return this.delete<IPersonaMotivation[]>(
      endpoints.personaMotivation(personaUuid, motivationUuid),
    );
  }

  reorderMotivations(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaMotivation[], IReorderItemsPayload>(
      endpoints.personaMotivationsReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Behaviours
  // ============================================

  addBehaviour(personaUuid: string, data: ICreateBehaviourPayload) {
    return this.post<IPersonaBehaviour[], ICreateBehaviourPayload>(
      endpoints.personaBehaviours(personaUuid),
      data,
    );
  }

  updateBehaviour(
    personaUuid: string,
    behaviourUuid: string,
    data: IUpdateBehaviourPayload,
  ) {
    return this.patch<IPersonaBehaviour[], IUpdateBehaviourPayload>(
      endpoints.personaBehaviour(personaUuid, behaviourUuid),
      data,
    );
  }

  deleteBehaviour(personaUuid: string, behaviourUuid: string) {
    return this.delete<IPersonaBehaviour[]>(
      endpoints.personaBehaviour(personaUuid, behaviourUuid),
    );
  }

  reorderBehaviours(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaBehaviour[], IReorderItemsPayload>(
      endpoints.personaBehavioursReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Key Facts
  // ============================================

  addKeyFact(personaUuid: string, data: ICreateKeyFactPayload) {
    return this.post<IPersonaKeyFact[], ICreateKeyFactPayload>(
      endpoints.personaKeyFacts(personaUuid),
      data,
    );
  }

  updateKeyFact(
    personaUuid: string,
    factUuid: string,
    data: IUpdateKeyFactPayload,
  ) {
    return this.patch<IPersonaKeyFact[], IUpdateKeyFactPayload>(
      endpoints.personaKeyFact(personaUuid, factUuid),
      data,
    );
  }

  deleteKeyFact(personaUuid: string, factUuid: string) {
    return this.delete<IPersonaKeyFact[]>(
      endpoints.personaKeyFact(personaUuid, factUuid),
    );
  }

  reorderKeyFacts(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaKeyFact[], IReorderItemsPayload>(
      endpoints.personaKeyFactsReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Quotes
  // ============================================

  addQuote(personaUuid: string, data: ICreateQuotePayload) {
    return this.post<IPersonaQuote[], ICreateQuotePayload>(
      endpoints.personaQuotes(personaUuid),
      data,
    );
  }

  updateQuote(
    personaUuid: string,
    quoteUuid: string,
    data: IUpdateQuotePayload,
  ) {
    return this.patch<IPersonaQuote[], IUpdateQuotePayload>(
      endpoints.personaQuote(personaUuid, quoteUuid),
      data,
    );
  }

  deleteQuote(personaUuid: string, quoteUuid: string) {
    return this.delete<IPersonaQuote[]>(
      endpoints.personaQuote(personaUuid, quoteUuid),
    );
  }

  reorderQuotes(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaQuote[], IReorderItemsPayload>(
      endpoints.personaQuotesReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Workday Steps
  // ============================================

  addWorkdayStep(personaUuid: string, data: ICreateWorkdayStepPayload) {
    return this.post<IPersonaWorkdayStep[], ICreateWorkdayStepPayload>(
      endpoints.personaWorkdaySteps(personaUuid),
      data,
    );
  }

  updateWorkdayStep(
    personaUuid: string,
    stepUuid: string,
    data: IUpdateWorkdayStepPayload,
  ) {
    return this.patch<IPersonaWorkdayStep[], IUpdateWorkdayStepPayload>(
      endpoints.personaWorkdayStep(personaUuid, stepUuid),
      data,
    );
  }

  deleteWorkdayStep(personaUuid: string, stepUuid: string) {
    return this.delete<IPersonaWorkdayStep[]>(
      endpoints.personaWorkdayStep(personaUuid, stepUuid),
    );
  }

  reorderWorkdaySteps(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaWorkdayStep[], IReorderItemsPayload>(
      endpoints.personaWorkdayStepsReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Chart Data
  // ============================================

  addChartData(personaUuid: string, data: ICreateChartDataPayload) {
    return this.post<IPersonaChartData[], ICreateChartDataPayload>(
      endpoints.personaChartData(personaUuid),
      data,
    );
  }

  updateChartData(
    personaUuid: string,
    dataUuid: string,
    data: IUpdateChartDataPayload,
  ) {
    return this.patch<IPersonaChartData[], IUpdateChartDataPayload>(
      endpoints.personaChartDataItem(personaUuid, dataUuid),
      data,
    );
  }

  deleteChartData(personaUuid: string, dataUuid: string) {
    return this.delete<IPersonaChartData[]>(
      endpoints.personaChartDataItem(personaUuid, dataUuid),
    );
  }

  reorderChartData(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<IPersonaChartData[], IReorderItemsPayload>(
      endpoints.personaChartDataReorder(personaUuid),
      data,
    );
  }

  // ============================================
  // Training Documents
  // ============================================

  /**
   * Get all training documents for a persona.
   */
  getTrainingDocuments(personaUuid: string) {
    return this.get<ITrainingDocument[]>(
      endpoints.personaTrainingDocuments(personaUuid),
    );
  }

  /**
   * Upload a training document for a persona.
   */
  uploadTrainingDocument(personaUuid: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.postFormData<ITrainingDocumentUploadResponse>(
      endpoints.personaTrainingDocuments(personaUuid),
      formData,
    );
  }

  /**
   * Delete a training document.
   */
  deleteTrainingDocument(personaUuid: string, documentUuid: string) {
    return this.delete<IMessageResponse>(
      endpoints.personaTrainingDocument(personaUuid, documentUuid),
    );
  }

  // ============================================
  // Evidence
  // ============================================

  /**
   * Get evidence for a persona.
   */
  getEvidence(
    personaUuid: string,
    status?: 'pending' | 'accepted' | 'ignored' | 'all',
  ) {
    return this.get<IEvidence[]>(
      endpoints.personaEvidence(personaUuid, status),
    );
  }

  /**
   * Accept an evidence item and apply its suggested update.
   */
  acceptEvidence(personaUuid: string, evidenceUuid: string) {
    return this.post<IEvidenceActionResponse>(
      endpoints.personaEvidenceAccept(personaUuid, evidenceUuid),
    );
  }

  /**
   * Ignore an evidence item.
   */
  ignoreEvidence(personaUuid: string, evidenceUuid: string) {
    return this.post<IEvidenceActionResponse>(
      endpoints.personaEvidenceIgnore(personaUuid, evidenceUuid),
    );
  }

  /**
   * Accept all pending evidence for a persona.
   */
  acceptAllEvidence(personaUuid: string) {
    return this.post<IMessageResponse>(
      endpoints.personaEvidenceAcceptAll(personaUuid),
    );
  }

  // ============================================
  // Chat
  // ============================================

  /**
   * Get all chat sessions for a persona.
   */
  getChatSessions(personaUuid: string) {
    return this.get<IChatSession[]>(endpoints.personaChatSessions(personaUuid));
  }

  /**
   * Get a single chat session with all messages.
   */
  getChatSession(personaUuid: string, sessionUuid: string) {
    return this.get<IChatSessionDetail>(
      endpoints.personaChatSession(personaUuid, sessionUuid),
    );
  }

  /**
   * Delete a chat session.
   */
  deleteChatSession(personaUuid: string, sessionUuid: string) {
    return this.delete<IMessageResponse>(
      endpoints.personaChatSession(personaUuid, sessionUuid),
    );
  }

  /**
   * Get starter prompts for a persona.
   */
  getStarterPrompts(personaUuid: string) {
    return this.get<IStarterPromptsResponse>(
      endpoints.personaChatPrompts(personaUuid),
    );
  }

  /**
   * Search conversations for a persona.
   */
  searchConversations(
    personaUuid: string,
    params?: { message?: string; page?: number },
  ) {
    const url = endpoints.personaChatConversations(personaUuid);
    return this.get<IPersonaConversationSearchResponse>(url, { params });
  }

  /**
   * Export a chat session as PDF.
   */
  exportConversationPdf(personaUuid: string, sessionUuid: string) {
    const url = endpoints.personaChatSessionExport(personaUuid, sessionUuid);
    return this.get<Blob>(url, { responseType: 'blob' });
  }

  // ============================================
  // Mention Search
  // ============================================

  /**
   * Search for mentionable items (concepts and personas).
   */
  searchMentions(
    query: string,
    type?: 'concept' | 'persona' | 'all',
    excludePersona?: string,
  ) {
    return this.get<IMentionSearchResponse>(
      endpoints.mentionSearch(query, type, excludePersona),
    );
  }

  // ============================================
  // Custom Widgets
  // ============================================

  createCustomWidget(personaUuid: string, data: ICreateCustomWidgetPayload) {
    return this.post<ICustomWidget[], ICreateCustomWidgetPayload>(
      `/api/v1/personas/${personaUuid}/custom-widgets`,
      toSnakeCaseKeys(data) as unknown as ICreateCustomWidgetPayload,
    );
  }

  updateCustomWidget(
    personaUuid: string,
    widgetUuid: string,
    data: IUpdateCustomWidgetPayload,
  ) {
    return this.patch<ICustomWidget[], IUpdateCustomWidgetPayload>(
      `/api/v1/personas/${personaUuid}/custom-widgets/${widgetUuid}`,
      toSnakeCaseKeys(data) as unknown as IUpdateCustomWidgetPayload,
    );
  }

  deleteCustomWidget(personaUuid: string, widgetUuid: string) {
    return this.delete<ICustomWidget[]>(
      `/api/v1/personas/${personaUuid}/custom-widgets/${widgetUuid}`,
    );
  }

  reorderCustomWidgets(personaUuid: string, data: IReorderItemsPayload) {
    return this.post<ICustomWidget[], IReorderItemsPayload>(
      `/api/v1/personas/${personaUuid}/custom-widgets/reorder`,
      data,
    );
  }

  // ============================================
  // Custom Widget Items
  // ============================================

  addCustomWidgetItem(
    personaUuid: string,
    widgetUuid: string,
    data: Record<string, unknown>,
  ) {
    return this.post<ICustomWidget, Record<string, unknown>>(
      `/api/v1/personas/${personaUuid}/custom-widgets/${widgetUuid}/items`,
      data,
    );
  }

  updateCustomWidgetItem(
    personaUuid: string,
    widgetUuid: string,
    itemUuid: string,
    data: Record<string, unknown>,
  ) {
    return this.patch<ICustomWidget, Record<string, unknown>>(
      `/api/v1/personas/${personaUuid}/custom-widgets/${widgetUuid}/items/${itemUuid}`,
      data,
    );
  }

  deleteCustomWidgetItem(
    personaUuid: string,
    widgetUuid: string,
    itemUuid: string,
  ) {
    return this.delete<ICustomWidget>(
      `/api/v1/personas/${personaUuid}/custom-widgets/${widgetUuid}/items/${itemUuid}`,
    );
  }

  reorderCustomWidgetItems(
    personaUuid: string,
    widgetUuid: string,
    data: IReorderItemsPayload,
  ) {
    return this.post<ICustomWidget, IReorderItemsPayload>(
      `/api/v1/personas/${personaUuid}/custom-widgets/${widgetUuid}/items/reorder`,
      data,
    );
  }
}

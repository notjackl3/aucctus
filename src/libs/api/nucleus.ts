import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  NucleusReport,
  NucleusReportListItem,
  NucleusQuestionCreateRequest,
  NucleusQuestionUpdateRequest,
  NucleusAnswerCreateRequest,
  NucleusAnswerUpdateRequest,
  NucleusSectionUpdateRequest,
  NucleusReportQuestion,
  NucleusReportAnswer,
  NucleusReportSection,
  NucleusReportProgress,
  NucleusVideoGenerateRequest,
  NucleusVideoGenerateResponse,
  NucleusStatus,
  InitializeNucleusRequest,
  InitializeNucleusResponse,
  DocumentWithUsage,
  DocumentUsage,
  CompanyLookupRequest,
  CompanyLookupResponse,
} from './types/nucleus';

/**
 * Nucleus API
 *
 * Handles all the requests for nucleus reports and related functionality.
 */
export class NucleusApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  /**
   * Generate a new nucleus report for the authenticated user's account.
   * Admin only. Triggers the nucleus generation pipeline asynchronously.
   * Returns 202 Accepted with a message indicating generation has started.
   */
  generateReport() {
    return this.post<{ message: string }>(endpoints.nucleusReportGenerate);
  }

  // ============================================
  // Nucleus Status & Initialization
  // ============================================

  /**
   * Get the Nucleus initialization status for the authenticated user's account.
   * Returns whether Nucleus has been initialized and if it's currently loading.
   */
  getNucleusStatus() {
    return this.get<NucleusStatus>(endpoints.nucleusStatus);
  }

  /**
   * Initialize Nucleus for the authenticated user's account.
   * Admin only. Saves company info, context questions, and triggers the Nucleus research pipeline.
   *
   * @param data Company information and context questions
   * @param files Optional array of files to include in research (uploaded during initialization)
   * @param headquartersImage Optional image file for HQ building (used for video generation)
   */
  initializeNucleus(
    data: InitializeNucleusRequest,
    files?: File[],
    headquartersImage?: File,
  ) {
    // Use multipart/form-data if any files are provided
    const hasFiles = (files && files.length > 0) || headquartersImage;

    if (hasFiles) {
      const formData = new FormData();

      // Append JSON data as 'data' field
      formData.append('data', JSON.stringify(data));

      // Append document files
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      // Append HQ image separately (for video generation)
      if (headquartersImage) {
        formData.append('headquartersImage', headquartersImage);
      }

      return this.post<InitializeNucleusResponse>(
        endpoints.nucleusInitialize,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
    }

    // No files - use regular JSON POST
    return this.post<InitializeNucleusResponse, InitializeNucleusRequest>(
      endpoints.nucleusInitialize,
      data,
    );
  }

  /**
   * Look up company headquarters and website from a company name using AI-powered web search.
   * Results are ephemeral and not persisted to the database.
   */
  lookupCompanyInfo(companyName: string) {
    return this.post<CompanyLookupResponse, CompanyLookupRequest>(
      endpoints.nucleusLookupCompanyInfo,
      { companyName },
    );
  }

  /**
   * Get all uploaded documents for the account with category usage.
   * Returns documents from the latest nucleus report with which categories use each document.
   */
  getDocuments() {
    return this.get<DocumentWithUsage[]>(endpoints.nucleusDocumentsList);
  }

  /**
   * Get usage/cascade information for a document before deletion.
   * Returns which categories and how many sources would be affected.
   */
  getDocumentUsage(documentUuid: string) {
    return this.get<DocumentUsage>(
      endpoints.nucleusDocumentUsage(documentUuid),
    );
  }

  /**
   * Delete a document and cascade delete all associated answer sources.
   * Admin only. Returns usage info showing what was deleted.
   */
  deleteDocument(documentUuid: string) {
    return this.delete<DocumentUsage>(
      endpoints.nucleusDocumentDelete(documentUuid),
    );
  }

  /**
   * Get the latest nucleus report for the authenticated user's account.
   * Returns the complete nucleus report with all sections, questions, answers, and sources.
   */
  getLatestReport() {
    return this.get<NucleusReport>(endpoints.nucleusReportLatest);
  }

  /**
   * Get the progress of the latest nucleus report for the authenticated user's account.
   * Returns processing status and progress information.
   */
  getLatestReportProgress() {
    return this.get<NucleusReportProgress>(
      endpoints.nucleusReportLatestProgress,
    );
  }

  /**
   * Get a list of nucleus reports for the authenticated user's account.
   * Returns simplified report data for overview/summary views.
   */
  getReportsList() {
    return this.get<NucleusReportListItem[]>(endpoints.nucleusReportsList);
  }

  /**
   * Get a specific nucleus report by UUID.
   * Returns the complete nucleus report with all related data.
   */
  getReportByUuid(reportUuid: string) {
    return this.get<NucleusReport>(endpoints.nucleusReportByUuid(reportUuid));
  }

  // Section CRUD operations
  /**
   * Update an existing section in a nucleus report.
   */
  updateSection(
    reportUuid: string,
    sectionUuid: string,
    data: NucleusSectionUpdateRequest,
  ) {
    return this.patch<NucleusReportSection, NucleusSectionUpdateRequest>(
      endpoints.nucleusSection(reportUuid, sectionUuid),
      data,
    );
  }

  // Question CRUD operations
  /**
   * Create a new question in a specific section of a nucleus report.
   */
  createQuestion(
    reportUuid: string,
    sectionUuid: string,
    data: NucleusQuestionCreateRequest,
  ) {
    return this.post<NucleusReportQuestion, NucleusQuestionCreateRequest>(
      endpoints.nucleusQuestions(reportUuid, sectionUuid),
      data,
    );
  }

  /**
   * Update an existing question in a nucleus report.
   */
  updateQuestion(
    reportUuid: string,
    questionUuid: string,
    data: NucleusQuestionUpdateRequest,
  ) {
    return this.patch<NucleusReportQuestion, NucleusQuestionUpdateRequest>(
      endpoints.nucleusQuestion(reportUuid, questionUuid),
      data,
    );
  }

  /**
   * Delete a question from a nucleus report.
   */
  deleteQuestion(reportUuid: string, questionUuid: string) {
    return this.delete(endpoints.nucleusQuestion(reportUuid, questionUuid));
  }

  // Answer CRUD operations
  /**
   * Create a new answer for a specific question in a nucleus report.
   */
  createAnswer(
    reportUuid: string,
    questionUuid: string,
    data: NucleusAnswerCreateRequest,
  ) {
    return this.post<NucleusReportAnswer, NucleusAnswerCreateRequest>(
      endpoints.nucleusAnswers(reportUuid, questionUuid),
      data,
    );
  }

  /**
   * Update an existing answer in a nucleus report.
   */
  updateAnswer(
    reportUuid: string,
    answerUuid: string,
    data: NucleusAnswerUpdateRequest,
  ) {
    return this.patch<NucleusReportAnswer, NucleusAnswerUpdateRequest>(
      endpoints.nucleusAnswer(reportUuid, answerUuid),
      data,
    );
  }

  /**
   * Delete an answer from a nucleus report.
   */
  deleteAnswer(reportUuid: string, answerUuid: string) {
    return this.delete(endpoints.nucleusAnswer(reportUuid, answerUuid));
  }

  /**
   * Upload documents to a nucleus report for processing.
   */
  uploadDocuments(reportUuid: string, files: File[]) {
    const formData = new FormData();

    // Append each file
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.post(endpoints.nucleusDocuments(reportUuid), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  emailWhenReady(reportUuid: string) {
    return this.post(endpoints.nucleusReportEmailWhenReady(reportUuid));
  }

  /**
   * Generate a nucleus headquarters video.
   * Admin only. Triggers the video generation pipeline asynchronously.
   * Returns task ID for status polling.
   *
   * Accepts optional image file for HQ building. If not provided, agent will search for images.
   */
  generateVideo(data: NucleusVideoGenerateRequest) {
    const formData = new FormData();

    // Append image file if provided
    if (data.image) {
      formData.append('image', data.image);
    }

    // Append other parameters as query params (mood, duration)
    const params = new URLSearchParams();
    if (data.mood) {
      params.append('mood', data.mood);
    }
    if (data.duration !== undefined) {
      params.append('duration', data.duration.toString());
    }

    const url = params.toString()
      ? `${endpoints.adminNucleusVideoGenerate}?${params.toString()}`
      : endpoints.adminNucleusVideoGenerate;

    return this.postFormData<NucleusVideoGenerateResponse>(url, formData);
  }
}

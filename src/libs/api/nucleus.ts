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
}

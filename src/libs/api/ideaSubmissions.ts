import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IBulkSubmissionUpdate,
  IBulkSubmissionUpdateResponse,
  ICompareSubmissionsRequest,
  ICompareSubmissionsResponse,
  ICreateIdeaSubmission,
  ICreateIdeaSubmissionViaLink,
  ICreateSubmissionLink,
  IFileUploadResponse,
  IIdeaSubmission,
  IIdeaSubmissionDetail,
  IProcessIdeasTaskResponse,
  IProcessTaskStatus,
  ISaveToBankRequest,
  ISaveToBankResponse,
  ISubmissionFilterParams,
  ISubmissionLink,
  ISubmissionLinkInfo,
  ISubmissionListResponse,
  IUpdateIdeaSubmissionStatus,
  IUpdateQuestionScoreRequest,
  IUpdateQuestionScoreResponse,
  IUpdateSubmissionLink,
} from './types/ideaSubmissions';

/**
 * Idea Submissions API
 *
 * Handles all requests for the Employee Idea Submission System.
 * Includes both public endpoints (for external form submissions)
 * and admin endpoints (for viewing/managing submissions).
 */
export class IdeaSubmissionsApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }

  // ============================================
  // Public Endpoints (No Authentication Required)
  // ============================================

  /**
   * Submit a new idea via the public form.
   * This endpoint does not require authentication.
   * @param accountUuid - The account UUID to submit the idea to
   * @param data - The idea submission data
   */
  submitIdea(accountUuid: string, data: ICreateIdeaSubmission) {
    return this.post<IIdeaSubmission, ICreateIdeaSubmission>(
      endpoints.ideaSubmissionsPublicSubmit(accountUuid),
      data,
    );
  }

  /**
   * Get basic account info for the public form.
   * Returns minimal account data (name) for display purposes.
   * @param accountUuid - The account UUID to get info for
   */
  getPublicAccountInfo(accountUuid: string) {
    return this.get<{ name: string; uuid: string }>(
      endpoints.ideaSubmissionsPublicAccountInfo(accountUuid),
    );
  }

  // ============================================
  // Admin Endpoints (Authentication Required)
  // ============================================

  /**
   * Get all idea submissions for the authenticated user's account.
   * Admin only endpoint.
   * @param filters - Optional filter parameters for sorting and filtering submissions
   */
  getAllSubmissions(filters?: ISubmissionFilterParams) {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.submissionLinkUuid) {
      params.append('submission_link_uuid', filters.submissionLinkUuid);
    }
    if (filters?.submissionDateRange?.start) {
      params.append('submission_date_start', filters.submissionDateRange.start);
    }
    if (filters?.submissionDateRange?.end) {
      params.append('submission_date_end', filters.submissionDateRange.end);
    }
    if (filters?.sortBy) {
      params.append('sort_by', filters.sortBy);
    }
    if (filters?.minTotalScore !== undefined) {
      params.append('min_total_score', filters.minTotalScore.toString());
    }
    if (filters?.maxTotalScore !== undefined) {
      params.append('max_total_score', filters.maxTotalScore.toString());
    }
    if (filters?.questionScoreFilter) {
      params.append('question_uuid', filters.questionScoreFilter.questionUuid);
      if (filters.questionScoreFilter.minScore !== undefined) {
        params.append(
          'min_question_score',
          filters.questionScoreFilter.minScore.toString(),
        );
      }
      if (filters.questionScoreFilter.maxScore !== undefined) {
        params.append(
          'max_question_score',
          filters.questionScoreFilter.maxScore.toString(),
        );
      }
    }

    const queryString = params.toString();
    const url = queryString
      ? `${endpoints.ideaSubmissionsAdmin}?${queryString}`
      : endpoints.ideaSubmissionsAdmin;

    return this.get<ISubmissionListResponse>(url);
  }

  /**
   * Get a single idea submission by UUID.
   * Admin only endpoint.
   * @param submissionUuid - The UUID of the submission to retrieve
   */
  getSubmission(submissionUuid: string) {
    return this.get<IIdeaSubmission>(
      endpoints.ideaSubmissionsAdminDetail(submissionUuid),
    );
  }

  /**
   * Update the status of an idea submission.
   * Admin only endpoint.
   * @param submissionUuid - The UUID of the submission to update
   * @param data - The new status data
   */
  updateSubmissionStatus(
    submissionUuid: string,
    data: IUpdateIdeaSubmissionStatus,
  ) {
    return this.patch<IIdeaSubmission, IUpdateIdeaSubmissionStatus>(
      endpoints.ideaSubmissionsAdminUpdateStatus(submissionUuid),
      data,
    );
  }

  /**
   * Delete an idea submission.
   * Admin only endpoint.
   * @param submissionUuid - The UUID of the submission to delete
   */
  deleteSubmission(submissionUuid: string) {
    return this.delete<{ detail: string }>(
      endpoints.ideaSubmissionsAdminDelete(submissionUuid),
    );
  }

  // ============================================
  // Processing Endpoints (Authentication Required)
  // ============================================

  /**
   * Process multiple idea submissions using AI.
   * De-duplicates, themes, and ranks ideas.
   * Admin only endpoint.
   * @param submissionUuids - Array of submission UUIDs to process
   */
  processIdeas(submissionUuids: string[]) {
    return this.post<IProcessIdeasTaskResponse, { submission_uuids: string[] }>(
      endpoints.ideaSubmissionsProcess,
      { submission_uuids: submissionUuids },
    );
  }

  /**
   * Get the status of an idea processing task.
   * Admin only endpoint.
   * @param taskId - The Celery task ID
   */
  getProcessingStatus(taskId: string) {
    return this.get<IProcessTaskStatus>(
      endpoints.ideaSubmissionsProcessStatus(taskId),
    );
  }

  // ============================================
  // Comparison Endpoint (Authentication Required)
  // ============================================

  /**
   * Compare multiple idea submissions using AI.
   * Analyzes 2-5 submissions and returns pros, cons, unknowns for each,
   * along with a recommended winner.
   * @param submissionUuids - Array of 2-5 submission UUIDs to compare
   */
  compareSubmissions(submissionUuids: string[]) {
    return this.post<ICompareSubmissionsResponse, ICompareSubmissionsRequest>(
      endpoints.ideaSubmissionsCompare,
      { submission_uuids: submissionUuids },
    );
  }

  // ============================================
  // Save to Bank Endpoint (Authentication Required)
  // ============================================

  /**
   * Save an idea submission to the concept bank.
   * Creates a new Concept from the submission's title and description.
   * @param submissionUuid - The UUID of the submission to save
   * @param options - Optional settings for the save operation
   * @param options.generateReport - If true, automatically generate a concept report
   */
  saveToBank(submissionUuid: string, options?: ISaveToBankRequest) {
    return this.post<ISaveToBankResponse, ISaveToBankRequest>(
      endpoints.ideaSubmissionsSaveToBank(submissionUuid),
      options ?? {},
    );
  }

  /**
   * Update a question score for an idea submission.
   * Allows manual adjustment of AI-generated scores.
   * @param submissionUuid - The UUID of the submission
   * @param questionUuid - The UUID of the question to update
   * @param score - The new score (1-5)
   */
  updateQuestionScore(
    submissionUuid: string,
    questionUuid: string,
    score: number,
  ) {
    return this.patch<
      IUpdateQuestionScoreResponse,
      IUpdateQuestionScoreRequest
    >(endpoints.ideaSubmissionsUpdateQuestionScore(submissionUuid), {
      question_uuid: questionUuid,
      score,
    });
  }

  /**
   * Upload a file containing idea submissions.
   * Supports CSV, XLSX, XLS, TSV, PDF, DOC, DOCX, and TXT files.
   * @param file - The file to upload
   * @param submissionLinkUuid - Optional UUID of the submission link to associate with.
   *                            If not provided, a new submission link will be auto-created based on the filename.
   */
  uploadFile(file: File, submissionLinkUuid?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (submissionLinkUuid) {
      formData.append('submission_link_uuid', submissionLinkUuid);
    }

    return this.postFormData<IFileUploadResponse>(
      endpoints.ideaSubmissionsUpload,
      formData,
    );
  }

  // ============================================
  // Bulk Update Endpoint (Authentication Required)
  // ============================================

  /**
   * Bulk update multiple idea submissions.
   * Supports updating scoring config and/or status for multiple submissions at once.
   * @param data - Submission UUIDs and fields to update
   */
  bulkUpdateSubmissions(data: IBulkSubmissionUpdate) {
    return this.patch<IBulkSubmissionUpdateResponse, IBulkSubmissionUpdate>(
      `${endpoints.ideaSubmissionsAdmin}/bulk-update`,
      data,
    );
  }

  // ============================================
  // Submission Link CRUD (Authentication Required)
  // ============================================

  /**
   * List all submission links for the current account.
   */
  listSubmissionLinks() {
    return this.get<ISubmissionLink[]>(endpoints.submissionLinks);
  }

  /**
   * Get a specific submission link by UUID.
   * @param linkUuid - The UUID of the submission link
   */
  getSubmissionLink(linkUuid: string) {
    return this.get<ISubmissionLink>(endpoints.submissionLinkDetail(linkUuid));
  }

  /**
   * Create a new submission link.
   * @param data - The submission link data (title, slug, description, password)
   */
  createSubmissionLink(data: ICreateSubmissionLink) {
    return this.post<ISubmissionLink, ICreateSubmissionLink>(
      endpoints.submissionLinks,
      data,
    );
  }

  /**
   * Update an existing submission link.
   * @param linkUuid - The UUID of the submission link
   * @param data - The fields to update
   */
  updateSubmissionLink(linkUuid: string, data: IUpdateSubmissionLink) {
    return this.patch<ISubmissionLink, IUpdateSubmissionLink>(
      endpoints.submissionLinkDetail(linkUuid),
      data,
    );
  }

  /**
   * Delete a submission link.
   * Note: This will NOT delete associated submissions.
   * @param linkUuid - The UUID of the submission link
   */
  deleteSubmissionLink(linkUuid: string) {
    return this.delete<{ detail: string }>(
      endpoints.submissionLinkDetail(linkUuid),
    );
  }

  /**
   * Get all submissions for a specific submission link.
   * @param linkUuid - The UUID of the submission link
   * @param filters - Optional filter parameters for sorting and filtering submissions
   */
  getSubmissionsByLink(linkUuid: string, filters?: ISubmissionFilterParams) {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.submissionDateRange?.start) {
      params.append('submission_date_start', filters.submissionDateRange.start);
    }
    if (filters?.submissionDateRange?.end) {
      params.append('submission_date_end', filters.submissionDateRange.end);
    }
    if (filters?.sortBy) {
      params.append('sort_by', filters.sortBy);
    }
    if (filters?.minTotalScore !== undefined) {
      params.append('min_total_score', filters.minTotalScore.toString());
    }
    if (filters?.maxTotalScore !== undefined) {
      params.append('max_total_score', filters.maxTotalScore.toString());
    }
    if (filters?.questionScoreFilter) {
      params.append('question_uuid', filters.questionScoreFilter.questionUuid);
      if (filters.questionScoreFilter.minScore !== undefined) {
        params.append(
          'min_question_score',
          filters.questionScoreFilter.minScore.toString(),
        );
      }
      if (filters.questionScoreFilter.maxScore !== undefined) {
        params.append(
          'max_question_score',
          filters.questionScoreFilter.maxScore.toString(),
        );
      }
    }

    const queryString = params.toString();
    const url = queryString
      ? `${endpoints.submissionLinkSubmissions(linkUuid)}?${queryString}`
      : endpoints.submissionLinkSubmissions(linkUuid);

    return this.get<ISubmissionListResponse>(url);
  }

  /**
   * Get detailed submission with full score breakdown.
   * Includes category scores, individual question scores, and AI reasoning.
   * @param linkUuid - The UUID of the submission link
   * @param submissionUuid - The UUID of the submission
   */
  getSubmissionDetail(linkUuid: string, submissionUuid: string) {
    return this.get<IIdeaSubmissionDetail>(
      endpoints.submissionLinkSubmissionDetail(linkUuid, submissionUuid),
    );
  }

  // ============================================
  // Slug-Based Public Endpoints (No Authentication)
  // ============================================

  /**
   * Get public info for a submission link.
   * This endpoint does not require authentication.
   * @param accountSlug - The account's namespace/slug
   * @param linkSlug - The submission link's slug
   */
  getSubmissionLinkInfo(accountSlug: string, linkSlug: string) {
    return this.get<ISubmissionLinkInfo>(
      endpoints.ideaSubmissionsPublicLinkInfo(accountSlug, linkSlug),
    );
  }

  /**
   * Submit a new idea via a submission link.
   * This endpoint does not require authentication.
   * @param accountSlug - The account's namespace/slug
   * @param linkSlug - The submission link's slug
   * @param data - The idea submission data
   */
  submitIdeaViaLink(
    accountSlug: string,
    linkSlug: string,
    data: ICreateIdeaSubmissionViaLink,
  ) {
    return this.post<IIdeaSubmission, ICreateIdeaSubmissionViaLink>(
      endpoints.ideaSubmissionsPublicLinkSubmit(accountSlug, linkSlug),
      data,
    );
  }
}

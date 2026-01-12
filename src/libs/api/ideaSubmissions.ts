import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ICreateIdeaSubmission,
  IIdeaSubmission,
  IProcessIdeasTaskResponse,
  IProcessTaskStatus,
  IUpdateIdeaSubmissionStatus,
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
   */
  getAllSubmissions() {
    return this.get<IIdeaSubmission[]>(endpoints.ideaSubmissionsAdmin);
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
}

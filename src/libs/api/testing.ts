import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  ITestDetails,
  ITestDetailsCreate,
  ITestDetailsUpdate,
  ITestCollateral,
  ITestCollateralCreate,
  ITestCollateralUpdate,
  ITestParticipant,
  ITestParticipantCreate,
  ITestParticipantUpdate,
  ITestResult,
  ITestResultCreate,
  ITestResultUpdate,
  ITestAssumption,
  ITestAssumptionCreate,
  ITestAssumptionUpdate,
  IPageResponse,
} from '@pages/Concept/Report/Testing/types';
import {
  IDistributionPreview,
  IDistributionPreviewRequest,
  ISyntheticExecutionRequest,
  ISyntheticExecutionStartResponse,
  ISyntheticExecutionStatusResponse,
  ITestCollateralOption,
  IApplyRecommendationsResponse,
  IGenerateNextTestResponse,
} from './types/concept/testing';

export class TestingApi extends ApiService {
  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
  }
  // Test Details endpoints
  async getTestDetails(
    conceptUuid: string,
  ): Promise<IPageResponse<ITestDetails>> {
    return this.get<IPageResponse<ITestDetails>>(
      endpoints.conceptTestingDetails(conceptUuid),
    );
  }

  async createTestDetails(
    conceptUuid: string,
    data: ITestDetailsCreate,
  ): Promise<ITestDetails> {
    return this.post<ITestDetails>(
      endpoints.conceptTestingDetails(conceptUuid),
      data,
    );
  }

  async getTestDetail(
    conceptUuid: string,
    testUuid: string,
  ): Promise<ITestDetails> {
    return this.get<ITestDetails>(
      endpoints.conceptTestingDetail(conceptUuid, testUuid),
    );
  }

  async updateTestDetail(
    conceptUuid: string,
    testUuid: string,
    data: ITestDetailsUpdate,
  ): Promise<ITestDetails> {
    return this.patch<ITestDetails>(
      endpoints.conceptTestingDetail(conceptUuid, testUuid),
      data,
    );
  }

  async completeTestDetails(
    conceptUuid: string,
    testUuid: string,
  ): Promise<ITestDetails> {
    return this.post<ITestDetails>(
      endpoints.conceptTestingComplete(conceptUuid, testUuid),
      {},
    );
  }

  async revertTestDetails(
    conceptUuid: string,
    testUuid: string,
  ): Promise<ITestDetails> {
    return this.post<ITestDetails>(
      endpoints.conceptTestingRevert(conceptUuid, testUuid),
      {},
    );
  }

  async regenerateTestDetails(
    conceptUuid: string,
    testUuid: string,
    data?: { assumption_uuids?: string[] },
  ): Promise<{ detail: string }> {
    return this.post<{ detail: string }>(
      endpoints.conceptTestingRegenerate(conceptUuid, testUuid),
      data ?? {},
    );
  }

  async deleteTestDetail(conceptUuid: string, testUuid: string): Promise<void> {
    return this.delete<void>(
      endpoints.conceptTestingDetail(conceptUuid, testUuid),
    );
  }

  // Test Collateral endpoints
  async getTestCollateral(
    conceptUuid: string,
    testUuid: string,
  ): Promise<IPageResponse<ITestCollateral>> {
    return this.get<IPageResponse<ITestCollateral>>(
      endpoints.conceptTestCollateral(conceptUuid, testUuid),
    );
  }

  async regenerateTestCollateral(
    conceptUuid: string,
    testUuid: string,
  ): Promise<ITestCollateral[]> {
    return this.post<ITestCollateral[]>(
      endpoints.conceptTestCollateralRegenerate(conceptUuid, testUuid),
      {},
    );
  }

  async createTestCollateral(
    conceptUuid: string,
    testUuid: string,
    data: ITestCollateralCreate,
  ): Promise<ITestCollateral> {
    return this.post<ITestCollateral>(
      endpoints.conceptTestCollateral(conceptUuid, testUuid),
      data,
    );
  }

  async uploadTestCollateralImage(
    conceptUuid: string,
    testUuid: string,
    file: File,
    options?: { title?: string; description?: string; order?: number },
  ): Promise<ITestCollateral> {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.title) {
      formData.append('title', options.title);
    }

    if (options?.description) {
      formData.append('description', options.description);
    }

    if (
      options?.order !== undefined &&
      options.order !== null &&
      !Number.isNaN(options.order)
    ) {
      formData.append('order', String(options.order));
    }

    return this.post<ITestCollateral>(
      endpoints.conceptTestCollateralUpload(conceptUuid, testUuid),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  async updateTestCollateral(
    conceptUuid: string,
    testUuid: string,
    collateralUuid: string,
    data: ITestCollateralUpdate,
  ): Promise<ITestCollateral> {
    return this.patch<ITestCollateral>(
      endpoints.conceptTestCollateralItem(
        conceptUuid,
        testUuid,
        collateralUuid,
      ),
      data,
    );
  }

  async deleteTestCollateral(
    conceptUuid: string,
    testUuid: string,
    collateralUuid: string,
  ): Promise<void> {
    return this.delete<void>(
      endpoints.conceptTestCollateralItem(
        conceptUuid,
        testUuid,
        collateralUuid,
      ),
    );
  }

  // Test Participants endpoints
  async getTestParticipants(
    conceptUuid: string,
    testUuid: string,
  ): Promise<IPageResponse<ITestParticipant>> {
    return this.get<IPageResponse<ITestParticipant>>(
      endpoints.conceptTestParticipants(conceptUuid, testUuid),
    );
  }

  async createTestParticipant(
    conceptUuid: string,
    testUuid: string,
    data: ITestParticipantCreate,
  ): Promise<ITestParticipant> {
    return this.post<ITestParticipant>(
      endpoints.conceptTestParticipants(conceptUuid, testUuid),
      data,
    );
  }

  async updateTestParticipant(
    conceptUuid: string,
    testUuid: string,
    participantUuid: string,
    data: ITestParticipantUpdate,
  ): Promise<ITestParticipant> {
    return this.patch<ITestParticipant>(
      endpoints.conceptTestParticipant(conceptUuid, testUuid, participantUuid),
      data,
    );
  }

  async deleteTestParticipant(
    conceptUuid: string,
    testUuid: string,
    participantUuid: string,
  ): Promise<void> {
    return this.delete<void>(
      endpoints.conceptTestParticipant(conceptUuid, testUuid, participantUuid),
    );
  }

  // Test Results endpoints
  async getTestResults(
    conceptUuid: string,
    testUuid: string,
  ): Promise<IPageResponse<ITestResult>> {
    return this.get<IPageResponse<ITestResult>>(
      endpoints.conceptTestResults(conceptUuid, testUuid),
    );
  }

  async createTestResult(
    conceptUuid: string,
    testUuid: string,
    data: ITestResultCreate,
  ): Promise<ITestResult> {
    return this.post<ITestResult>(
      endpoints.conceptTestResults(conceptUuid, testUuid),
      data,
    );
  }

  // Method for creating test results with multiple files upload
  async createTestResultWithFiles(
    conceptUuid: string,
    testUuid: string,
    files: File[],
    summary?: string,
    recommendations?: string,
  ): Promise<ITestResult[]> {
    const formData = new FormData();

    // Append each file
    files.forEach((file) => {
      formData.append('files', file);
    });

    if (summary) {
      formData.append('summary', summary);
    }

    if (recommendations) {
      formData.append('recommendations', recommendations);
    }

    return this.post<ITestResult[]>(
      endpoints.conceptTestResults(conceptUuid, testUuid),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  async updateTestResult(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
    data: ITestResultUpdate,
  ): Promise<ITestResult> {
    return this.patch<ITestResult>(
      endpoints.conceptTestResult(conceptUuid, testUuid, resultUuid),
      data,
    );
  }

  // Method for adding additional files to existing test results
  async addFilesToTestResult(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
    files: File[],
    data?: { summary?: string; recommendations?: string },
  ): Promise<ITestResult> {
    const formData = new FormData();

    // Append each file
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Append any additional data
    if (data?.summary) {
      formData.append('summary', data.summary);
    }

    if (data?.recommendations) {
      formData.append('recommendations', data.recommendations);
    }

    // Use POST to add files to existing result
    return this.post<ITestResult>(
      endpoints.conceptTestResultFiles(conceptUuid, testUuid, resultUuid),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  }

  async deleteTestResult(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
  ): Promise<void> {
    return this.delete<void>(
      endpoints.conceptTestResult(conceptUuid, testUuid, resultUuid),
    );
  }

  async deleteTestResultFile(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
    fileUuid: string,
  ): Promise<void> {
    return this.delete<void>(
      endpoints.conceptTestResultFile(
        conceptUuid,
        testUuid,
        resultUuid,
        fileUuid,
      ),
    );
  }

  // Export test results as PDF
  async exportTestResults(
    conceptUuid: string,
    testUuid: string,
    format: string = 'pdf',
  ): Promise<Blob> {
    return this.get<Blob>(
      endpoints.conceptTestResultsExport(conceptUuid, testUuid, format),
      {
        headers: {
          Accept: 'application/pdf',
        },
        responseType: 'blob',
      },
    );
  }

  // Test Assumptions endpoints
  async getTestAssumptions(
    conceptUuid: string,
    testUuid: string,
  ): Promise<IPageResponse<ITestAssumption>> {
    return this.get<IPageResponse<ITestAssumption>>(
      endpoints.conceptTestAssumptions(conceptUuid, testUuid),
    );
  }

  async createTestAssumption(
    conceptUuid: string,
    testUuid: string,
    data: ITestAssumptionCreate,
  ): Promise<ITestAssumption> {
    return this.post<ITestAssumption>(
      endpoints.conceptTestAssumptions(conceptUuid, testUuid),
      data,
    );
  }

  async updateTestAssumption(
    conceptUuid: string,
    testUuid: string,
    assumptionUuid: string,
    data: ITestAssumptionUpdate,
  ): Promise<ITestAssumption> {
    return this.put<ITestAssumption>(
      endpoints.conceptTestAssumption(conceptUuid, testUuid, assumptionUuid),
      data,
    );
  }

  async deleteTestAssumption(
    conceptUuid: string,
    testUuid: string,
    assumptionUuid: string,
  ): Promise<void> {
    return this.delete<void>(
      endpoints.conceptTestAssumption(conceptUuid, testUuid, assumptionUuid),
    );
  }

  // Execute synthetic test with real-time progress
  async executeSyntheticTest(
    conceptUuid: string,
    testUuid: string,
    data?: ISyntheticExecutionRequest,
  ): Promise<ISyntheticExecutionStartResponse> {
    return this.post(
      endpoints.conceptTestSyntheticExecution(conceptUuid, testUuid),
      data || {},
    );
  }

  // Cancel synthetic execution
  async cancelSyntheticExecution(
    conceptUuid: string,
    testUuid: string,
    executionId: string,
  ): Promise<{
    success: boolean;
    executionId: string;
    workflowExecutionUuid?: string;
    message: string;
    revokedTasks?: any;
  }> {
    return this.delete(
      endpoints.conceptTestSyntheticExecutionCancel(
        conceptUuid,
        testUuid,
        executionId,
      ),
    );
  }

  // Get synthetic execution history
  async getSyntheticExecutionHistory(
    conceptUuid: string,
    testUuid: string,
    limit: number = 10,
  ): Promise<{
    executions: Array<{
      executionId: string;
      conceptUuid: string;
      testUuid: string;
      workflowExecutionUuid: string;
      status: string;
      progress: number;
      message: string;
      startedAt?: string;
      completedAt?: string;
      resultsCount?: number;
      durationSeconds?: number;
      error?: any;
    }>;
    totalCount: number;
  }> {
    return this.get(
      `${endpoints.conceptTestSyntheticExecutionHistory(conceptUuid, testUuid)}?limit=${limit}`,
    );
  }

  // Get distribution preview for synthetic testing
  async getDistributionPreview(
    conceptUuid: string,
    testUuid: string,
    data: IDistributionPreviewRequest,
  ): Promise<IDistributionPreview> {
    return this.post(
      endpoints.conceptTestDistributionPreview(conceptUuid, testUuid),
      data,
    );
  }

  // Get available test collaterals for synthetic testing
  async getTestCollaterals(
    conceptUuid: string,
    testUuid: string,
  ): Promise<ITestCollateralOption[]> {
    return this.get(endpoints.conceptTestCollaterals(conceptUuid, testUuid));
  }

  // Get synthetic execution status
  async getSyntheticExecutionStatus(
    conceptUuid: string,
    testUuid: string,
    executionId: string,
  ): Promise<ISyntheticExecutionStatusResponse> {
    return this.get(
      endpoints.conceptTestSyntheticExecutionStatus(
        conceptUuid,
        testUuid,
        executionId,
      ),
    );
  }

  // Get current running execution
  async getCurrentSyntheticExecution(
    conceptUuid: string,
    testUuid: string,
  ): Promise<ISyntheticExecutionStatusResponse | null> {
    return this.get(
      endpoints.conceptTestSyntheticExecutionCurrent(conceptUuid, testUuid),
    );
  }

  // Apply comprehensive edit recommendations
  async applyRecommendations(
    conceptUuid: string,
    testUuid: string,
    recommendationUuids: string[],
  ): Promise<IApplyRecommendationsResponse> {
    return this.post<IApplyRecommendationsResponse>(
      `api/v2/concept/${conceptUuid}/testing/${testUuid}/apply-recommendations`,
      { recommendationUuids },
    );
  }

  // Generate next recommended test
  async generateNextTest(
    conceptUuid: string,
  ): Promise<IGenerateNextTestResponse> {
    return this.post<IGenerateNextTestResponse>(
      endpoints.conceptTestingGenerateNext(conceptUuid),
      {},
    );
  }
}

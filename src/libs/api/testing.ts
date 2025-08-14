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

  // New method for creating test results with file upload
  async createTestResultWithFile(
    conceptUuid: string,
    testUuid: string,
    file: File,
    summary?: string,
    recommendations?: string,
  ): Promise<ITestResult> {
    const formData = new FormData();
    formData.append('file', file);

    if (summary) {
      formData.append('summary', summary);
    }

    if (recommendations) {
      formData.append('recommendations', recommendations);
    }

    return this.post<ITestResult>(
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

  async deleteTestResult(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
  ): Promise<void> {
    return this.delete<void>(
      endpoints.conceptTestResult(conceptUuid, testUuid, resultUuid),
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
}

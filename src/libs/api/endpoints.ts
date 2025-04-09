import utils from '@libs/utils';
import {
  IConceptQueryOptions,
  ISeedQueryOptions,
  IUserQueryOptions,
} from './types';

export class Endpoints {
  static login = '/api/v1/login';
  static signup = '/api/v1/sign-up';
  static logout = '/api/v1/logout';
  static refresh = '/api/v1/token/refresh';

  static user = '/api/v1/user/';
  static allUsers = '/api/v1/user/list';

  static articlePublishedDate = '/article-published-date';

  static confirmEmail = `/api/v1/confirm-email`;
  static forgotPassword = `/api/v1/forgot-password`;
  static requestPasswordReset = `/api/v1/request-reset-email`;
  static updatePassword = `/api/v1/user/update-password`;

  static account = `/api/v1/account`;
  static dashboard = `/api/v1/dashboard`;

  static concept = 'api/v1/concept/';
  static seed = `api/v2/concept/seed`;

  static conceptAiEditing = 'api/v2/concept/ai/report/edit';

  static conceptQuestionnaire = '/api/v1/concept/ignition/questionnaires';

  static conceptUuid(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/`;
  }

  static conceptSnapshotUuid(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/snapshot/download`;
  }

  static conceptReportRetry(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/retry`;
  }

  static conceptSeed(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/seed`;
  }

  static seedQueries(options?: ISeedQueryOptions) {
    return utils.string.queryStringGenerator(this.seed, options);
  }

  static seedUuid(seedUuid: string, options?: ISeedQueryOptions) {
    const url = `${this.seed}/${seedUuid}`;

    if (options) {
      return utils.string.queryStringGenerator(url, options);
    }

    return url;
  }

  static conceptIncubationSeedUuidAnswer(draftUuid: string) {
    return `api/v2/concept/incubation/seed/${draftUuid}/answer`;
  }

  static conceptIncubationSeedUuidAnswers(draftUuid: string) {
    return `api/v2/concept/incubation/seed/${draftUuid}/answers`;
  }

  static conceptIncubationSeedAnswerId(answerId: number) {
    return `api/v2/concept/incubation/seed/answer/${answerId}`;
  }

  static conceptGenerate(seedUuid: string) {
    return `api/v2/concept/incubation/seed/${seedUuid}/generate-concepts`;
  }

  static conceptIncubationSeedAnswerIdAndDeleteHigherOrderAnswers(
    answerId: number,
  ) {
    return `api/v2/concept/incubation/seed/answer/update_and_delete_higher_order/${answerId}`;
  }

  static conceptIncubationSeedUuidClarifyingQuestions(seedUuid: string) {
    return `api/v2/concept/incubation/seed/${seedUuid}/clarifying-questions`;
  }

  static saveGeneratedConcept(seedUuid: string) {
    return `api/v2/concept/incubation/seed/${seedUuid}/generated`;
  }

  static saveConceptVersion(conceptUuid: string) {
    return `api/v2/concept/version/${conceptUuid}/save`;
  }

  static listConceptVersions(conceptUuid: string) {
    return `api/v2/concept/version/${conceptUuid}/list`;
  }

  static revertConceptVersion(conceptUuid: string) {
    return `api/v2/concept/version/${conceptUuid}/revert`;
  }

  static commitConceptReversion(conceptUuid: string) {
    return `api/v2/concept/version/${conceptUuid}/commit`;
  }

  static cancelConceptReversion(conceptUuid: string) {
    return `api/v2/concept/version/${conceptUuid}/cancel`;
  }

  static unarchiveConcept(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/unarchive`;
  }

  static conceptOverview(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/overview`;
  }

  static conceptOverviewUuid(overviewUuid: string) {
    return `api/v1/concept/overview/${overviewUuid}`;
  }

  static conceptCustomerProfiles(
    conceptUuid: string,
    version: 'v1' | 'v2' = 'v1',
  ) {
    return `api/${version}/concept/${conceptUuid}/customer-profile`;
  }

  static conceptCustomerProfileUuid(
    customerProfileUuid: string,
    version: 'v1' | 'v2' = 'v1',
  ) {
    return `api/${version}/concept/customer-profile/${customerProfileUuid}`;
  }

  static conceptKeyAssumptions(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/key-assumptions`;
  }

  static conceptKeyAssumption(assumptionUuid: string) {
    return `api/v1/concept/key-assumption/${assumptionUuid}`;
  }

  static conceptFinancialProjection(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/financial-projection`;
  }

  static conceptFinancialProjectionUuid(projectionUuid: string) {
    return `api/v1/concept/financial-projection/${projectionUuid}`;
  }

  static conceptMarketScan(conceptUuid: string, version: 'v1' | 'v2' = 'v1') {
    return `api/${version}/concept/${conceptUuid}/market-scan/`;
  }

  static conceptMarketScanUuid(marketScanUuid: string) {
    return `api/v2/concept/market-scan/${marketScanUuid}`;
  }

  static conceptTrendAndDriver(trendAndDriverUuid: string) {
    return `api/v1/concept/trends-and-drivers/${trendAndDriverUuid}`;
  }

  static conceptEcosystem(ecosystemUuid: string) {
    return `api/v1/concept/ecosystem/${ecosystemUuid}`;
  }

  static assumptionTestsDetails(assumptionUuid: string) {
    return `api/v1/concept/assumption/${assumptionUuid}/test-details`;
  }

  static incumbentUuid(incumbentUuid: string) {
    return `api/v2/concept/incumbent/${incumbentUuid}`;
  }

  static startupUuid(startupUuid: string) {
    return `api/v2/concept/startup/${startupUuid}`;
  }

  static assumptionTestDetailsUuid(
    assumptionUuid: string,
    assumptionTestUuid: string,
  ) {
    return `api/v1/concept/assumption/${assumptionUuid}/test-details/${assumptionTestUuid}`;
  }

  static assumptionStartTest(
    assumptionUuid: string,
    assumptionTestUuid: string,
  ) {
    return `api/v1/concept/assumption/${assumptionUuid}/test-details/${assumptionTestUuid}/start`;
  }

  static conceptTestStepUuid(conceptTestStepUuid: string, stepUuid: string) {
    return `api/v1/concept/test/${conceptTestStepUuid}/step/${stepUuid}`;
  }

  static assumptionTestStatusOverview(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/test-status`;
  }

  static conceptTestDetails(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/test`;
  }

  static conceptTestDetailsUuid(conceptUuid: string, conceptTestUuid: string) {
    return `api/v1/concept/${conceptUuid}/test/${conceptTestUuid}`;
  }

  static allUsersQuery(options?: IUserQueryOptions) {
    return utils.string.queryStringGenerator(this.allUsers, options);
  }

  static conceptQueries(options?: IConceptQueryOptions) {
    return utils.string.queryStringGenerator(this.concept, options);
  }

  // TODO: Add trends and drivers and ecosystem endpoints for v2
}

export class SocketEndpoints {
  static aucctus = '/ws/v1/aucctus';
}

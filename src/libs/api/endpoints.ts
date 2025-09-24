import utils from '@libs/utils';
import {
  IConceptQueryOptions,
  IConversationFilterOptions,
  ISeedQueryOptions,
  IUserQueryOptions,
} from './types';

export class Endpoints {
  static user = '/api/v1/user/';
  static allUsers = '/api/v1/user/list';

  static articlePublishedDate = '/article-published-date';

  static account = `/api/v1/account`;
  static dashboard = `/api/v1/dashboard`;

  static concept = 'api/v1/concept/';
  static seed = `api/v2/concept/seed`;

  static conceptAiEditing = 'api/v2/concept/ai/report/edit';

  static conceptQuestionnaire = '/api/v1/concept/ignition/questionnaires';

  static conceptIdentifier(identifier: string) {
    return `api/v1/concept/${identifier}/`;
  }

  static conceptSnapshotUuid(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/snapshot/download`;
  }

  static conceptReportRetry(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/retry`;
  }

  static conceptReportGenerate(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/generate`;
  }

  static conceptReportCancel(conceptUuid: string) {
    return `api/v1/concept/${conceptUuid}/cancel`;
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

  static cloneSeed(seedUuid: string) {
    return `${this.seed}/${seedUuid}/clone`;
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
    return `api/v2/concept/${conceptUuid}/overview`;
  }

  static conceptOverviewUuid(overviewUuid: string) {
    return `api/v1/concept/overview/${overviewUuid}`;
  }

  static conceptExecutiveSummaries(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/executive-summaries`;
  }

  static conceptCustomerProfiles(
    conceptUuid: string,
    version: 'v1' | 'v2' = 'v1',
  ) {
    return `api/${version}/concept/${conceptUuid}/customer-profile`;
  }

  static conceptCustomerProfileUuid(customerProfileUuid: string) {
    return `api/v2/concept/customer-profile/${customerProfileUuid}`;
  }

  static conceptCustomerProfileRealWorldSignals(customerProfileUuid: string) {
    return `api/v2/concept/customer-profile/${customerProfileUuid}/real-world-signals`;
  }

  static conceptCustomerProfileRealWorldSignalUuid(
    customerProfileUuid: string,
    realWorldSignalUuid: string,
  ) {
    return `api/v2/concept/customer-profile/${customerProfileUuid}/real-world-signals/${realWorldSignalUuid}`;
  }

  static conceptCustomerProfileConversationMessages(
    customerProfileUuid: string,
    sessionId: string,
  ) {
    return `api/v2/concept/customer-profile/${customerProfileUuid}/conversation/${sessionId}/messages`;
  }

  static conceptCustomerProfileConversationList(
    customerProfileUuid: string,
    filterOptions?: IConversationFilterOptions,
  ) {
    return utils.string.queryStringGenerator(
      `api/v2/concept/customer-profile/${customerProfileUuid}/conversation`,
      filterOptions,
    );
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

  // Customer Jobs Endpoints
  static customerProfileJobs(customerProfileUuid: string) {
    return `/api/v2/concept/customer-profile/${customerProfileUuid}/jobs`;
  }
  static customerProfileJob(customerProfileUuid: string, jobUuid: string) {
    return `/api/v2/concept/customer-profile/${customerProfileUuid}/jobs/${jobUuid}`;
  }

  // Customer Pains Endpoints
  static customerProfilePains(customerProfileUuid: string) {
    return `/api/v2/concept/customer-profile/${customerProfileUuid}/pains`;
  }
  static customerProfilePain(customerProfileUuid: string, painUuid: string) {
    return `/api/v2/concept/customer-profile/${customerProfileUuid}/pains/${painUuid}`;
  }

  // Customer Alternatives Endpoints
  static customerProfileAlternatives(customerProfileUuid: string) {
    return `/api/v2/concept/customer-profile/${customerProfileUuid}/alternatives`;
  }

  // User Journey Steps Endpoints
  static customerProfileJourneySteps(customerProfileUuid: string) {
    return `/api/v2/concept/customer-profile/${customerProfileUuid}/journey-steps`;
  }
  static customerProfileJourneyStep(
    customerProfileUuid: string,
    stepUuid: string,
  ) {
    return `/api/v2/concept/customer-profile/${customerProfileUuid}/journey-steps/${stepUuid}`;
  }

  static conceptSeen(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/seen`;
  }

  // Assumptions & Testing v2 Endpoints

  static conceptKeyAssumptionsFiltered(
    rootIdentifier: string,
    filters?: Record<string, any>,
  ) {
    return utils.string.queryStringGenerator(
      `api/v2/concept/${rootIdentifier}/key-assumptions`,
      filters,
    );
  }

  static conceptTestingDetails(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing`;
  }

  static conceptTestingDetail(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/details`;
  }

  static conceptTestingComplete(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/complete`;
  }

  static conceptTestCollateral(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/collateral`;
  }

  static conceptTestCollateralItem(
    conceptUuid: string,
    testUuid: string,
    collateralUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/collateral/${collateralUuid}`;
  }

  static conceptTestParticipants(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/participants`;
  }

  static conceptTestParticipant(
    conceptUuid: string,
    testUuid: string,
    participantUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/participants/${participantUuid}`;
  }

  static conceptTestResults(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/results`;
  }

  static conceptTestResult(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/results/${resultUuid}`;
  }

  static conceptTestResultFile(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
    fileUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/results/${resultUuid}/files/${fileUuid}`;
  }

  static conceptTestResultsExport(
    conceptUuid: string,
    testUuid: string,
    format: string = 'pdf',
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/results/export?format=${format}`;
  }

  static conceptTestResultFiles(
    conceptUuid: string,
    testUuid: string,
    resultUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/results/${resultUuid}/files`;
  }

  static conceptTestAssumptions(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/assumptions`;
  }

  static conceptTestAssumption(
    conceptUuid: string,
    testUuid: string,
    assumptionUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/assumptions/${assumptionUuid}`;
  }

  static conceptTestSyntheticExecution(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/synthetic-execution`;
  }

  static conceptTestSyntheticExecutionStatus(
    conceptUuid: string,
    testUuid: string,
    executionId: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/synthetic-execution/${executionId}/status`;
  }

  static conceptTestSyntheticExecutionCancel(
    conceptUuid: string,
    testUuid: string,
    executionId: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/synthetic-execution/${executionId}`;
  }

  static conceptTestSyntheticExecutionHistory(
    conceptUuid: string,
    testUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/synthetic-execution/history`;
  }

  static conceptTestDistributionPreview(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/distribution-preview`;
  }

  static conceptTestCollaterals(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/collaterals`;
  }

  static generateKeyAssumptions(conceptIdentifier: string) {
    return `api/v2/concept/${conceptIdentifier}/key-assumptions/generate`;
  }

  // Assumption Lifecycle Endpoints (V2)
  static addKeyAssumption(rootIdentifier: string) {
    return `api/v2/concept/${rootIdentifier}/key-assumptions/add`;
  }

  static updateKeyAssumption(rootIdentifier: string, assumptionUuid: string) {
    return `api/v2/concept/${rootIdentifier}/key-assumptions/${assumptionUuid}/update`;
  }

  static removeKeyAssumption(rootIdentifier: string, assumptionUuid: string) {
    return `api/v2/concept/${rootIdentifier}/key-assumptions/${assumptionUuid}/remove`;
  }

  static generateConceptOverview(conceptIdentifier: string) {
    return `api/v2/concept/${conceptIdentifier}/overview/generate`;
  }

  static generateFinancialProjection(conceptIdentifier: string) {
    return `api/v2/concept/${conceptIdentifier}/financial-projection/generate`;
  }

  static generateCustomerProfile(conceptIdentifier: string) {
    return `api/v2/concept/${conceptIdentifier}/customer-profile/generate`;
  }

  static generateMarketScan(conceptIdentifier: string) {
    return `api/v3/concept/${conceptIdentifier}/market-scan/generate`;
  }

  // Financial Projection V2 Endpoints
  static financialProjectionV2(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/financial-projection`;
  }

  // Pricing endpoints
  static financialProjectionPricing(financialProjectionUuid: string) {
    return `api/v2/concept/financial-projection/${financialProjectionUuid}/pricing`;
  }

  static pricingUuid(pricingUuid: string) {
    return `api/v2/concept/financial-projection/pricing/${pricingUuid}`;
  }

  // Business Model endpoints
  static financialProjectionBusinessModel(financialProjectionUuid: string) {
    return `api/v2/concept/financial-projection/${financialProjectionUuid}/business-model`;
  }

  static businessModelUuid(businessModelUuid: string) {
    return `api/v2/concept/financial-projection/business-model/${businessModelUuid}`;
  }

  // Market Sizing endpoints
  static financialProjectionMarketSizing(financialProjectionUuid: string) {
    return `api/v2/concept/financial-projection/${financialProjectionUuid}/market-sizing`;
  }

  static marketSizingUuid(marketSizingUuid: string) {
    return `api/v2/concept/financial-projection/market-sizing/${marketSizingUuid}`;
  }

  // Cost Driver endpoints
  static financialProjectionCostDriver(financialProjectionUuid: string) {
    return `api/v2/concept/financial-projection/${financialProjectionUuid}/cost-driver`;
  }

  static costDriverUuid(costDriverUuid: string) {
    return `api/v2/concept/financial-projection/cost-driver/${costDriverUuid}`;
  }

  // Distribution Channel endpoints
  static financialProjectionDistributionChannel(
    financialProjectionUuid: string,
  ) {
    return `api/v2/concept/financial-projection/${financialProjectionUuid}/distribution-channel`;
  }

  static distributionChannelUuid(distributionChannelUuid: string) {
    return `api/v2/concept/financial-projection/distribution-channel/${distributionChannelUuid}`;
  }

  // Trends and Drivers V3 Endpoints
  static conceptTrendsV3(conceptUuid: string) {
    return `api/v3/concept/${conceptUuid}/trends/`;
  }

  static conceptTrendV3(conceptUuid: string, trendUuid: string) {
    return `api/v3/concept/${conceptUuid}/trends/${trendUuid}`;
  }

  static conceptTrendKeyFindings(conceptUuid: string, trendUuid: string) {
    return `api/v3/concept/${conceptUuid}/trends/${trendUuid}/key-findings/`;
  }

  static conceptTrendKeyFinding(
    conceptUuid: string,
    trendUuid: string,
    keyFindingUuid: string,
  ) {
    return `api/v3/concept/${conceptUuid}/trends/${trendUuid}/key-findings/${keyFindingUuid}`;
  }

  static conceptTrendAnalysisV3(conceptUuid: string) {
    return `api/v3/concept/${conceptUuid}/trend-analysis/`;
  }

  // Market Scan V3 Endpoints
  static conceptMarketScanTrendsV3(conceptUuid: string) {
    return `api/v3/concept/${conceptUuid}/market-scan/trends/`;
  }

  static conceptMarketScanPriorityInsightsV3(conceptUuid: string) {
    return `api/v3/concept/${conceptUuid}/market-scan/priority-insights/`;
  }

  static conceptMarketScanMarketForcesV3(conceptUuid: string) {
    return `api/v3/concept/${conceptUuid}/market-scan/market-forces/`;
  }

  // Nucleus Report Endpoints
  static nucleusReportLatest = '/api/v1/nucleus-reports/latest';
  static nucleusReportsList = '/api/v1/nucleus-reports/';

  static nucleusReportByUuid(reportUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}`;
  }

  // Nucleus Sections Endpoints
  static nucleusSection(reportUuid: string, sectionUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}/sections/${sectionUuid}`;
  }

  // Nucleus Questions Endpoints
  static nucleusQuestions(reportUuid: string, sectionUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}/sections/${sectionUuid}/questions`;
  }

  static nucleusQuestion(reportUuid: string, questionUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}/questions/${questionUuid}`;
  }

  // Nucleus Answers Endpoints
  static nucleusAnswers(reportUuid: string, questionUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}/questions/${questionUuid}/answers`;
  }

  static nucleusAnswer(reportUuid: string, answerUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}/answers/${answerUuid}`;
  }
}

export class SocketEndpoints {
  static aucctus = '/ws/v1/aucctus';
}

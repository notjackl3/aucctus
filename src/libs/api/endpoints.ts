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
  static logoSearch = '/logo-search';

  static account = `/api/v1/account`;
  static accountLogo = `/api/v1/account/logo`;
  static dashboard = `/api/v1/dashboard`;

  static concept = 'api/v1/concept/';
  static seed = `api/v2/concept/seed`;

  static conceptAiEditing = 'api/v2/concept/ai/report/edit';

  static conceptQuestionnaire = '/api/v1/concept/ignition/questionnaires';

  static agentTiming(agentName: string, conceptUuid?: string) {
    const baseUrl = `api/v2/concept/agent-timing/${agentName}`;
    if (conceptUuid) {
      return `${baseUrl}?concept_uuid=${conceptUuid}`;
    }
    return baseUrl;
  }

  static syntheticPipelineEstimate(conceptUuid: string, numProfiles: number) {
    return `api/v2/concept/agent-timing/synthetic-pipeline/estimate?concept_uuid=${conceptUuid}&num_profiles=${numProfiles}`;
  }

  static conceptIdentifier(identifier: string) {
    return `api/v1/concept/${identifier}/`;
  }

  static conceptMagicShareGenerate(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/magic-share/generate`;
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

  static conceptReportNotifyOnComplete(
    conceptUuid: string,
    sectionKey?: string,
  ) {
    const base = `api/v1/concept/${conceptUuid}/notify-on-complete`;
    return sectionKey ? `${base}?section_key=${sectionKey}` : base;
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

  static conceptOverviewUploadImage(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/overview/upload-image`;
  }

  static conceptPriority(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/priority`;
  }

  static conceptPriorityDetail(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/priority/detail`;
  }

  static conceptPriorityList() {
    return `api/v2/concept/priority/list`;
  }

  static conceptPriorityPortfolioSummary() {
    return `api/v2/concept/priority/portfolio-summary`;
  }

  static conceptPriorityGenerate(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/priority/generate`;
  }

  static conceptPriorityGenerateBulk() {
    return `api/v2/concept/priority/generate-bulk`;
  }

  static conceptPriorityUpdateQuestionScore(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/priority/question-score`;
  }

  static conceptOverviewImageSettings(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/overview/image-settings`;
  }

  static conceptOverviewUuid(overviewUuid: string) {
    return `api/v1/concept/overview/${overviewUuid}`;
  }

  static conceptExecutiveSummaries(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/executive-summaries`;
  }

  static conceptVideoGenerate(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/video/generate`;
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

  static conceptCustomerProfileConversationExport(
    customerProfileUuid: string,
    sessionId: string,
  ) {
    return `api/v2/concept/customer-profile/${customerProfileUuid}/conversation/${sessionId}/export`;
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

  static conceptTestingRevert(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/revert`;
  }

  static conceptTestingRegenerate(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/regenerate`;
  }

  static conceptTestingGenerateNext(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/generate-next`;
  }

  static conceptTestCollateral(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/collateral`;
  }

  static conceptTestCollateralRegenerate(
    conceptUuid: string,
    testUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/collateral/regenerate`;
  }

  static conceptTestApplyRecommendations(
    conceptUuid: string,
    testUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/apply-recommendations`;
  }

  static conceptTestCollateralItem(
    conceptUuid: string,
    testUuid: string,
    collateralUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/collateral/${collateralUuid}`;
  }

  static conceptTestCollateralUpload(conceptUuid: string, testUuid: string) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/collateral/upload-image`;
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

  static conceptTestSyntheticExecutionCurrent(
    conceptUuid: string,
    testUuid: string,
  ) {
    return `api/v2/concept/${conceptUuid}/testing/${testUuid}/synthetic-execution/current`;
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

  static batchUpdateKeyAssumptions(rootIdentifier: string) {
    return `api/v2/concept/${rootIdentifier}/key-assumptions/batch`;
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

  static generateTrendsAndDrivers(conceptIdentifier: string) {
    return `api/v3/concept/${conceptIdentifier}/trends-and-drivers/generate`;
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

  // Magic Share Endpoints
  static conceptMagicShareLatest(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/magic-share/latest`;
  }

  static emailConceptMagicShare(conceptUuid: string, magicShareUuid: string) {
    return `api/v2/concept/${conceptUuid}/magic-share/${magicShareUuid}/email`;
  }

  static clearConceptMagicShare(conceptUuid: string) {
    return `api/v2/concept/${conceptUuid}/magic-share/clear`;
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

  static conceptEcosystemV2(conceptUuid: string) {
    return `api/v3/concept/${conceptUuid}/ecosystem/`;
  }

  static conceptEcosystemV2Generate(rootIdentifier: string) {
    return `api/v3/concept/${rootIdentifier}/ecosystem/generate`;
  }

  // Scoring Configuration Endpoints
  static scoringConfigs(accountUuid: string) {
    return `/api/v1/accounts/${accountUuid}/scoring-configs`;
  }

  static scoringConfigDetail(accountUuid: string, configUuid: string) {
    return `/api/v1/accounts/${accountUuid}/scoring-configs/${configUuid}`;
  }

  static scoringConfigSetDefault(accountUuid: string, configUuid: string) {
    return `/api/v1/accounts/${accountUuid}/scoring-configs/${configUuid}/set-default`;
  }

  static scoringConfigFullDetail(accountUuid: string, configUuid: string) {
    return `/api/v1/accounts/${accountUuid}/scoring-configs/${configUuid}/detail`;
  }

  // Bulk Concept Update Endpoint
  static conceptBulkUpdate = 'api/v2/concept/bulk-update';

  // Nucleus Report Endpoints
  static nucleusReportGenerate = '/api/v1/nucleus-reports/generate';
  static nucleusReportLatest = '/api/v1/nucleus-reports/latest';
  static nucleusReportLatestProgress =
    '/api/v1/nucleus-reports/latest/progress';
  static nucleusReportsList = '/api/v1/nucleus-reports/';

  static nucleusReportByUuid(reportUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}`;
  }

  static nucleusReportEmailWhenReady(reportUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}/email-when-ready`;
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

  // Nucleus Documents Endpoints
  static nucleusDocuments(reportUuid: string) {
    return `/api/v1/nucleus-reports/${reportUuid}/upload`;
  }

  // Nucleus Status & Initialization Endpoints
  static nucleusStatus = '/api/v1/nucleus-reports/status';
  static nucleusInitialize = '/api/v1/nucleus-reports/initialize';
  static nucleusLookupCompanyInfo =
    '/api/v1/nucleus-reports/lookup-company-info';
  static nucleusDocumentsList = '/api/v1/nucleus-reports/documents';
  static nucleusDocumentUsage(documentUuid: string) {
    return `/api/v1/nucleus-reports/documents/${documentUuid}/usage`;
  }
  static nucleusDocumentDelete(documentUuid: string) {
    return `/api/v1/nucleus-reports/documents/${documentUuid}`;
  }

  // Nucleus Video Endpoints (Admin only)
  static adminNucleusVideoGenerate = '/api/v1/admin/nucleus-video/generate';

  // Admin Metrics Endpoints (now under analytics)
  static adminMetrics = '/api/v1/analytics/metrics';

  // Admin Account Logo Endpoint
  static adminAccountLogoUpload = '/api/v1/admin/account-logo/upload';

  // Admin User Metrics Endpoints
  static adminUserMetrics = '/api/v1/analytics/users';
  static adminUserMetricsDetail(userUuid: string) {
    return `/api/v1/analytics/users/${userUuid}`;
  }

  // Idea Playground Endpoints
  static ideaPlaygroundAnchorThoughts =
    'api/v2/concept/idea-playground/anchor-thoughts';
  static ideaPlaygroundSeed = 'api/v2/concept/idea-playground/seed';
  static ideaPlaygroundSeedWithFile =
    'api/v2/concept/idea-playground/seed-with-file';

  static ideaPlaygroundSeedAnchorThought(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/anchor-thought`;
  }

  static ideaPlaygroundSeedQuestions(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions`;
  }

  static ideaPlaygroundDeleteQuestion(seedUuid: string, questionUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}`;
  }

  static ideaPlaygroundPossibleAnswer(seedUuid: string, questionUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}/possible-answer`;
  }

  static ideaPlaygroundResearchInsights(
    seedUuid: string,
    questionUuid: string,
  ) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}/research-insights`;
  }

  static ideaPlaygroundUserAnswer(seedUuid: string, questionUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}/user-answer`;
  }

  static ideaPlaygroundIncludeAnswer(
    seedUuid: string,
    questionUuid: string,
    answerUuid: string,
  ) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}/answers/${answerUuid}/include`;
  }

  static ideaPlaygroundExcludeAnswer(
    seedUuid: string,
    questionUuid: string,
    answerUuid: string,
  ) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}/answers/${answerUuid}/exclude`;
  }

  static ideaPlaygroundRemoveUserAnswer(
    seedUuid: string,
    questionUuid: string,
  ) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}/user-answer`;
  }

  static ideaPlaygroundGenerateIdeas(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/generate-ideas`;
  }

  static ideaPlaygroundGeneratedIdeas(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/generated-ideas`;
  }

  static ideaPlaygroundDeleteGeneratedConcept(
    seedUuid: string,
    conceptUuid: string,
  ) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/generated-ideas/${conceptUuid}`;
  }

  static ideaPlaygroundGenerateMoreIdeas(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/generate-more-ideas`;
  }

  static ideaPlaygroundRegenerateIdeasWithFeedback(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/regenerate-ideas-with-feedback`;
  }

  static ideaPlaygroundConcepts(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/concepts`;
  }

  static ideaPlaygroundSaveConcepts(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/save-concepts`;
  }

  static ideaPlaygroundSeedContext(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/context`;
  }

  // Watchtower Endpoints
  static watchtowerDashboard = '/api/v1/watchtower/dashboard';
  static watchtowerRefresh = '/api/v1/watchtower/refresh';
  static watchtowerRules = '/api/v1/watchtower/rules';
  static watchtowerScans = '/api/v1/watchtower/scans';

  static watchtowerRule(ruleUuid: string) {
    return `/api/v1/watchtower/rules/${ruleUuid}`;
  }

  static watchtowerOpportunityAddToBank(opportunityUuid: string) {
    return `/api/v1/watchtower/opportunities/${opportunityUuid}/add-to-bank`;
  }

  static watchtowerSignalTracking(signalUuid: string) {
    return `/api/v1/watchtower/signals/${signalUuid}/tracking`;
  }

  // Competitor Assessment Endpoints
  static competitorAssessmentDashboard =
    '/api/v1/competitor-assessment/dashboard';
  static competitorAssessmentRefresh = '/api/v1/competitor-assessment/refresh';
  static competitorAssessmentCompetitors =
    '/api/v1/competitor-assessment/competitors';
  static competitorAssessmentConfig = '/api/v1/competitor-assessment/config';
  static competitorAssessmentWhiteSpaces =
    '/api/v1/competitor-assessment/white-spaces';

  static competitorAssessmentCompetitor(competitorUuid: string) {
    return `/api/v1/competitor-assessment/competitors/${competitorUuid}`;
  }

  // Portfolio Executive Summary Endpoints
  static portfolioExecutiveSummary = '/api/v1/portfolio/executive-summary';

  // POC Plan Endpoints
  static pocPlanGenerate(conceptUuid: string) {
    return `/api/v2/concept/${conceptUuid}/poc-plan/generate`;
  }

  static pocPlan(conceptUuid: string) {
    return `/api/v2/concept/${conceptUuid}/poc-plan`;
  }

  static pocPlanStatus(conceptUuid: string) {
    return `/api/v2/concept/${conceptUuid}/poc-plan/status`;
  }

  static pocPlanExists(conceptUuid: string) {
    return `/api/v2/concept/${conceptUuid}/poc-plan/exists`;
  }

  static pocPlanModalContent(conceptUuid: string) {
    return `/api/v2/concept/${conceptUuid}/poc-plan/modal-content`;
  }

  // Idea Submissions Endpoints (Public - no auth required)
  static ideaSubmissionsPublicSubmit(accountUuid: string) {
    return `/api/idea-submissions/${accountUuid}/submit`;
  }

  static ideaSubmissionsPublicAccountInfo(accountUuid: string) {
    return `/api/idea-submissions/${accountUuid}/info`;
  }

  // Idea Submissions Endpoints (Admin - Authenticated)
  static ideaSubmissionsAdmin = '/api/v1/idea-submissions';

  static ideaSubmissionsAdminDetail(submissionUuid: string) {
    return `/api/v1/idea-submissions/${submissionUuid}`;
  }

  static ideaSubmissionsAdminUpdateStatus(submissionUuid: string) {
    return `/api/v1/idea-submissions/${submissionUuid}/status`;
  }

  static ideaSubmissionsAdminDelete(submissionUuid: string) {
    return `/api/v1/idea-submissions/${submissionUuid}`;
  }

  // Idea Submissions Processing Endpoints
  static ideaSubmissionsProcess = '/api/v1/idea-submissions/process';

  static ideaSubmissionsProcessStatus(taskId: string) {
    return `/api/v1/idea-submissions/process/${taskId}/status`;
  }

  // Idea Submissions - Compare Endpoint
  static ideaSubmissionsCompare = '/api/v1/idea-submissions/compare';

  // Idea Submissions - Save to Bank Endpoint
  static ideaSubmissionsSaveToBank(submissionUuid: string) {
    return `/api/v1/idea-submissions/${submissionUuid}/save-to-bank`;
  }

  // Idea Submissions - Update Question Score Endpoint
  static ideaSubmissionsUpdateQuestionScore(submissionUuid: string) {
    return `/api/v1/idea-submissions/${submissionUuid}/question-score`;
  }

  // Idea Submissions - File Upload Endpoint
  static ideaSubmissionsUpload = '/api/v1/idea-submissions/upload';

  // ============================================
  // Submission Link Endpoints (Auth Required)
  // ============================================
  static submissionLinks = '/api/v1/submission-links';

  static submissionLinkDetail(linkUuid: string) {
    return `/api/v1/submission-links/${linkUuid}`;
  }

  static submissionLinkSubmissions(linkUuid: string) {
    return `/api/v1/submission-links/${linkUuid}/submissions`;
  }

  /**
   * Get detailed submission with full score breakdown.
   * @param linkUuid - The submission link UUID
   * @param submissionUuid - The submission UUID
   */
  static submissionLinkSubmissionDetail(
    linkUuid: string,
    submissionUuid: string,
  ) {
    return `/api/v1/submission-links/${linkUuid}/submissions/${submissionUuid}/details`;
  }

  // ============================================
  // Public Submission Link Endpoints (No Auth)
  // ============================================

  /**
   * Get public info for a submission link.
   * @param accountSlug - The account's namespace/slug
   * @param linkSlug - The submission link's slug
   */
  static ideaSubmissionsPublicLinkInfo(accountSlug: string, linkSlug: string) {
    return `/api/idea-submissions/${accountSlug}/${linkSlug}/info`;
  }

  /**
   * Submit an idea via a submission link.
   * @param accountSlug - The account's namespace/slug
   * @param linkSlug - The submission link's slug
   */
  static ideaSubmissionsPublicLinkSubmit(
    accountSlug: string,
    linkSlug: string,
  ) {
    return `/api/idea-submissions/${accountSlug}/${linkSlug}/submit`;
  }

  // ============================================
  // Custom Commands Endpoints (Overseer)
  // ============================================
  static customCommands = '/api/v1/chat/custom-commands';
  static customCommandsPicker = '/api/v1/chat/custom-commands/picker';

  static customCommandDetail(commandUuid: string) {
    return `/api/v1/chat/custom-commands/${commandUuid}`;
  }

  // ============================================
  // Overseer History Endpoints
  // ============================================

  static overseerConversations(params?: {
    page?: number;
    conceptUuid?: string;
    accountUuid?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.conceptUuid)
      searchParams.append('concept_uuid', params.conceptUuid);
    if (params?.accountUuid)
      searchParams.append('account_uuid', params.accountUuid);
    const query = searchParams.toString();
    return `/api/v1/chat/overseer/conversations${query ? `?${query}` : ''}`;
  }

  static overseerConversationDetail(uuid: string) {
    return `/api/v1/chat/overseer/conversations/${uuid}`;
  }

  // ============================================
  // Dynamic Component Endpoints
  // ============================================
  static dynamicComponentGenerate = '/api/v1/dynamic-components/generate';

  static dynamicComponentDetail(componentUuid: string) {
    return `/api/v1/dynamic-components/${componentUuid}`;
  }

  static dynamicComponentsForConcept(conceptUuid: string) {
    return `/api/v1/dynamic-components/concept/${conceptUuid}`;
  }

  // ============================================
  // Living Personas Endpoints
  // ============================================
  static personas = '/api/v1/personas/';

  static persona(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}`;
  }

  static personaTags(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/tags`;
  }

  static personaTag(personaUuid: string, tagUuid: string) {
    return `/api/v1/personas/${personaUuid}/tags/${tagUuid}`;
  }

  static personaDemographics(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/demographics`;
  }

  // Persona nested content endpoints
  static personaJobs(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/jobs`;
  }

  static personaJob(personaUuid: string, jobUuid: string) {
    return `/api/v1/personas/${personaUuid}/jobs/${jobUuid}`;
  }

  static personaJobsReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/jobs/reorder`;
  }

  static personaPains(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/pains`;
  }

  static personaPain(personaUuid: string, painUuid: string) {
    return `/api/v1/personas/${personaUuid}/pains/${painUuid}`;
  }

  static personaPainsReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/pains/reorder`;
  }

  static personaGains(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/gains`;
  }

  static personaGain(personaUuid: string, gainUuid: string) {
    return `/api/v1/personas/${personaUuid}/gains/${gainUuid}`;
  }

  static personaGainsReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/gains/reorder`;
  }

  static personaSocialValues(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/social-values`;
  }

  static personaSocialValue(personaUuid: string, valueUuid: string) {
    return `/api/v1/personas/${personaUuid}/social-values/${valueUuid}`;
  }

  static personaSocialValuesReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/social-values/reorder`;
  }

  static personaMotivations(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/motivations`;
  }

  static personaMotivation(personaUuid: string, motivationUuid: string) {
    return `/api/v1/personas/${personaUuid}/motivations/${motivationUuid}`;
  }

  static personaMotivationsReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/motivations/reorder`;
  }

  static personaBehaviours(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/behaviours`;
  }

  static personaBehaviour(personaUuid: string, behaviourUuid: string) {
    return `/api/v1/personas/${personaUuid}/behaviours/${behaviourUuid}`;
  }

  static personaBehavioursReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/behaviours/reorder`;
  }

  static personaKeyFacts(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/key-facts`;
  }

  static personaKeyFact(personaUuid: string, factUuid: string) {
    return `/api/v1/personas/${personaUuid}/key-facts/${factUuid}`;
  }

  static personaKeyFactsReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/key-facts/reorder`;
  }

  static personaQuotes(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/quotes`;
  }

  static personaQuote(personaUuid: string, quoteUuid: string) {
    return `/api/v1/personas/${personaUuid}/quotes/${quoteUuid}`;
  }

  static personaQuotesReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/quotes/reorder`;
  }

  static personaWorkdaySteps(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/workday-steps`;
  }

  static personaWorkdayStep(personaUuid: string, stepUuid: string) {
    return `/api/v1/personas/${personaUuid}/workday-steps/${stepUuid}`;
  }

  static personaWorkdayStepsReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/workday-steps/reorder`;
  }

  static personaChartData(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/chart-data`;
  }

  static personaChartDataItem(personaUuid: string, dataUuid: string) {
    return `/api/v1/personas/${personaUuid}/chart-data/${dataUuid}`;
  }

  static personaChartDataReorder(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/chart-data/reorder`;
  }

  // Persona training documents
  static personaTrainingDocuments(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/training-documents`;
  }

  static personaTrainingDocument(personaUuid: string, documentUuid: string) {
    return `/api/v1/personas/${personaUuid}/training-documents/${documentUuid}`;
  }

  // Persona evidence
  static personaEvidence(personaUuid: string, status?: string) {
    const base = `/api/v1/personas/${personaUuid}/evidence`;
    return status ? `${base}?status=${status}` : base;
  }

  static personaEvidenceAccept(personaUuid: string, evidenceUuid: string) {
    return `/api/v1/personas/${personaUuid}/evidence/${evidenceUuid}/accept`;
  }

  static personaEvidenceIgnore(personaUuid: string, evidenceUuid: string) {
    return `/api/v1/personas/${personaUuid}/evidence/${evidenceUuid}/ignore`;
  }

  static personaEvidenceAcceptAll(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/evidence/accept-all`;
  }

  // Persona chat
  static personaChatSessions(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/chat/sessions`;
  }

  static personaChatSession(personaUuid: string, sessionUuid: string) {
    return `/api/v1/personas/${personaUuid}/chat/sessions/${sessionUuid}`;
  }

  static personaChatMessages(personaUuid: string, sessionUuid: string) {
    return `/api/v1/personas/${personaUuid}/chat/sessions/${sessionUuid}/messages`;
  }

  static personaChatPrompts(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/chat/prompts`;
  }

  static personaChatConversations(personaUuid: string) {
    return `/api/v1/personas/${personaUuid}/chat/conversations`;
  }

  static personaChatSessionExport(personaUuid: string, sessionUuid: string) {
    return `/api/v1/personas/${personaUuid}/chat/sessions/${sessionUuid}/export`;
  }

  // Mention search
  static mentionSearch(query: string, type?: string) {
    const base = `/api/v1/mentions/search?q=${encodeURIComponent(query)}`;
    return type ? `${base}&type=${type}` : base;
  }

  // ============================================
  // Portfolio Insights Endpoints
  // ============================================

  /**
   * List portfolio insights with pagination.
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page (max 100)
   */
  static portfolioInsights(page?: number, pageSize?: number) {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    const query = params.toString();
    return `/api/v1/portfolio/insights${query ? `?${query}` : ''}`;
  }
}

export class SocketEndpoints {
  static aucctus = '/ws/v1/aucctus';
}

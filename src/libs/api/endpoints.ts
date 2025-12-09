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

  // Nucleus Report Endpoints
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

  // Idea Playground Endpoints
  static ideaPlaygroundAnchorThoughts =
    'api/v2/concept/idea-playground/anchor-thoughts';
  static ideaPlaygroundSeed = 'api/v2/concept/idea-playground/seed';

  static ideaPlaygroundSeedAnchorThought(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/anchor-thought`;
  }

  static ideaPlaygroundSeedQuestions(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions`;
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

  static ideaPlaygroundNucleusInsights(seedUuid: string, questionUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/questions/${questionUuid}/nucleus-insights`;
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

  static ideaPlaygroundConcepts(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/concepts`;
  }

  static ideaPlaygroundSaveConcepts(seedUuid: string) {
    return `api/v2/concept/idea-playground/seed/${seedUuid}/save-concepts`;
  }
}

export class SocketEndpoints {
  static aucctus = '/ws/v1/aucctus';
}

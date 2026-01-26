/* Concept Details */
export enum ConceptPath {
  Overview = 'overview',
  MarketScan = 'market-scan',
  FinancialProjection = 'financial-projection',
  CustomerProfile = 'customer-profile',
  Assumptions = 'assumptions',
  Settings = 'settings',
  Testing = 'testing',
}

export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IncubateConcept = '/concept/incubate',
  IncubateConceptWithUuid = '/concept/incubate/:uuid',
  GeneratedConcepts = '/concept/incubate/results',
  Concept = '/concept',
  ConceptBank = '/concept',
  ConceptBankPortfolio = '/concept/portfolio',
  ConceptBankDrafts = '/concept/drafts',
  ConceptBankSubmissions = '/concept/submissions',
  ConceptBankSubmissionDetail = '/concept/submissions/:linkUuid',
  ConceptOverview = '/concept/:id/',
  ConceptCustomerProfile = `/concept/:id/${ConceptPath.CustomerProfile}`,
  ConceptFinancialProjection = `/concept/:id/${ConceptPath.FinancialProjection}`,
  ConceptKeyAssumptions = `/concept/:id/${ConceptPath.Assumptions}`,
  ConceptMarketScan = `/concept/:id/${ConceptPath.MarketScan}`,
  ConceptSettings = `/concept/:id/${ConceptPath.Settings}`,
  ConceptTesting = `/concept/:id/${ConceptPath.Testing}`,

  /* Challenges */
  ChallengeCenter = '/challenge',
  ChallengeWizard = '/challenge/wizards',
  ChallengeDetails = '/challenge/:id',

  /* Nucleus */
  Nucleus = '/nucleus',

  /* Signal Scanning */
  SignalScanning = '/signal-scanning',

  /* Watchtower */
  Watchtower = '/watchtower',
  WatchtowerInitiation = '/watchtower/initiation',

  /* Innovation Pipeline */
  InnovationPipeline = '/innovation-pipeline',

  /* Idea Playground */
  IdeaPlayground = '/playground',

  /* Idea Submissions */
  IdeaSubmissionsAdmin = '/idea-submissions',
  SubmissionLinks = '/submission-links',
  SubmissionLinkDetail = '/submission-links/:linkUuid',
  SubmissionLinkPublicForm = '/submit/:accountSlug/:linkSlug',

  /* Settings */
  Settings = '/settings',
  SettingsAbout = '/settings/about',
  SettingsSecurity = '/settings/security',

  /* Testing */
  Testing = '/testing',
  TestingConceptOverview = '/testing/concept-overview',

  /* Auth */
  Login = '/login',
  SignUp = '/sign-up',
  VerifyEmail = '/verify-email',
  ConfirmEmail = '/confirm-email',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password',
}

export const UNAUTH_ROUTES = [
  AppPath.Login,
  AppPath.SignUp,
  AppPath.VerifyEmail,
  AppPath.ConfirmEmail,
  AppPath.ForgotPassword,
  AppPath.ResetPassword,
  AppPath.SubmissionLinkPublicForm,
];

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
  ConceptBankDrafts = '/concept/drafts',
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

  /* Settings */
  Settings = '/settings',
  SettingsAbout = '/settings/about',
  SettingsSecurity = '/settings/security',

  /* Testing */
  Testing = '/testing',
  TestingNucleus = '/testing/nucleus',

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
];

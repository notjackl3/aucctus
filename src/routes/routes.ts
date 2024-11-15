/* Concept Details */
export enum ConceptPath {
  Overview = 'overview',
  MarketScan = 'market-scan',
  FinancialProjection = 'financial-projection',
  CustomerProfile = 'customer-profile',
  Assumptions = 'assumptions',
  ConceptSettings = 'settings',
}

export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IgniteConcept = '/concept/ignite',
  GeneratedConcepts = '/concept/ignite/results',
  Concept = '/concept',
  ConceptBank = '/concept',
  ConceptOverview = '/concept/:id/',
  ConceptCustomerProfile = `/concept/:id/${ConceptPath.CustomerProfile}`,
  ConceptFinancialProjection = `/concept/:id/${ConceptPath.FinancialProjection}`,
  ConceptKeyAssumptions = `/concept/:id/${ConceptPath.Assumptions}`,
  ConceptMarketScan = `/concept/:id/${ConceptPath.MarketScan}`,
  ConceptSettings = `/concept/:id/${ConceptPath.ConceptSettings}`,

  /* Challenges */
  ChallengeCenter = '/challenge',
  ChallengeWizard = '/challenge/wizards',
  ChallengeDetails = '/challenge/:id',

  /* Settings */
  Settings = '/settings',
  SettingsAbout = '/settings/about',
  SettingsSecurity = '/settings/security',

  /* Auth */
  Login = '/login',
  SignUp = '/sign-up',
  ConfirmEmail = '/confirm-email',
  EmailConfirmation = '/email-confirmation',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password',
  ResetPasswordSuccess = '/reset-password/success',
}

export const UNAUTH_ROUTES = [
  AppPath.Login,
  AppPath.SignUp,
  AppPath.ConfirmEmail,
  AppPath.EmailConfirmation,
  AppPath.ForgotPassword,
  AppPath.ResetPassword,
  AppPath.ResetPasswordSuccess,
];

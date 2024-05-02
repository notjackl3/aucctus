export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IgniteConcept = '/concept/ignite',
  GeneratedConcepts = '/concept/ignite/results',
  Concept = '/concept',
  ConceptCategory = '/concept',
  ConceptOverview = '/concept/:id/',
  ConceptCustomerProfile = '/concept/:id/customer-profile',
  ConceptFinancialProjection = '/concept/:id/financial-projection',
  ConceptKeyAssumptions = '/concept/:id/key-assumptions',
  ConceptMarketScan = '/concept/:id/market-scan',
  ConceptSnapshot = '/concept/snapshot',

  /* Domain */
  IgniteDomain = '/domain/ignite',
  DomainList = '/domain/list',
  DomainMarket = '/domain/:id/overview',

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

/* Concept Details */
export enum ConceptPath {
  Overview = 'overview',
  MarketScan = 'market-scan',
  FinancialProjection = 'financial-projection',
  CustomerProfile = 'customer-profile',
  KeyAssumptions = 'key-assumptions',
}

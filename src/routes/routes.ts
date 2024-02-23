export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IgniteConcept = '/concept/ignite',
  GeneratedConcepts = '/concept/ignite/results',
  ConceptList = '/concept/list',

  ConceptOverview = '/concept/:id/overview',
  ConceptCustomerPersona = '/concept/:id/customer-profile',

  /* Domain */
  IgniteDomain = '/domain/ignite',
  DomainList = '/domain/list',
  DomainMarket = '/domain/:id/overview',

  /* Challenges */
  ChallengeCenter = '/challenge',
  ChallengeWizard = '/challenge/wizards',
  ChallengeDetails = '/challenge/:id',

  /* Auth */
  Login = '/login',
  SignUp = '/sign-up',
  ConfirmEmail = '/confirm-email',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password',
  ResetPasswordSuccess = '/reset-password/success',
}

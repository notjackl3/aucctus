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
  SignIn = '/sign-in',
  SignUp = '/sign-up',
  SignUpSuccess = '/confirm-email',
  ConfirmEmail = '/confirm-email/:token',
  ForgotPassword = '/forgot-password',
}

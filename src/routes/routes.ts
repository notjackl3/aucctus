

export enum AppPath {
  Home = '/',
  Onboarding = '/onboarding',

  /* Concepts */
  IgniteConcept = '/concept/ignite',
  GeneratedConcepts = '/concept/ignite/results',
  ConceptList = '/concept/list',
  ConceptOverview = '/concept/overview/:id',


  /* Domain */
  IgniteDomain = '/domain/ignite',
  DomainList = '/domain/list',
  DomainMarket = '/domain/overview/:id',



  /* Auth */
  SignIn = "/sign-in",
  SignUp = "/sign-up",
  SignUpSuccess = "/confirm-email",
  ConfirmEmail = "/confirm-email/:token",
  ForgotPassword = "/forgot-password",

}